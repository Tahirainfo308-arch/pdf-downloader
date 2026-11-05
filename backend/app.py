import ipaddress
import os
import socket
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import quote, urlparse

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from playwright.async_api import Error as PlaywrightError
from playwright.async_api import async_playwright

import database as db

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FREE_PLAN_LIMIT = int(os.getenv("FREE_PLAN_LIMIT", "5"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

app = FastAPI(
    title="PDFly API",
    description="Convert any web page into a high-quality PDF.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise unauthorized
    except JWTError:
        raise unauthorized

    user = db.get_user_by_id(user_id)
    if user is None:
        raise unauthorized
    return user


def validate_public_url(raw_url: str) -> str:
    """Reject non-http(s) URLs and internal/private hosts (SSRF protection)."""
    raw_url = raw_url.strip()
    if not raw_url.startswith(("http://", "https://")):
        raw_url = "https://" + raw_url

    parsed = urlparse(raw_url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise HTTPException(status_code=400, detail="Please enter a valid URL.")

    hostname = parsed.hostname.lower()
    if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1") or hostname.endswith(
        ".local"
    ):
        raise HTTPException(status_code=400, detail="This host is not allowed.")

    try:
        addresses = {
            info[4][0] for info in socket.getaddrinfo(hostname, None)
        }
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Could not resolve this website.")

    for address in addresses:
        ip = ipaddress.ip_address(address)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            raise HTTPException(status_code=400, detail="This host is not allowed.")

    return raw_url


CLEAN_CSS = """
nav, aside,
body > header, body > footer,
[role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"],
[class*="advert"], [id*="advert"],
[class*="cookie-banner"], [id*="cookie-banner"], [class*="cookie-consent"],
[class*="newsletter"], [class*="social-share"],
[class*="sticky-cta"], [class*="popup-banner"] {
  display: none !important;
}

article, main, [role="main"] {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
"""


async def render_pdf(url: str, clean: bool = True) -> bytes:
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        try:
            page = await browser.new_page(viewport={"width": 1440, "height": 900})
            await page.goto(url, wait_until="networkidle", timeout=60_000)
            await page.emulate_media(media="screen")
            if clean:
                await page.add_style_tag(content=CLEAN_CSS)
                await page.wait_for_timeout(250)
            pdf = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "12mm", "right": "10mm", "bottom": "12mm", "left": "10mm"},
            )
            return pdf
        finally:
            await browser.close()


@app.get("/")
def health():
    return {"status": "ok", "service": "PDFly API"}


@app.post("/api/auth/signup", response_model=db.Token)
def signup(payload: db.UserCreate):
    if db.get_user_by_email(payload.email):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = db.create_user(
        payload.name, payload.email, hash_password(payload.password)
    )
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "user": db.public_user(user)}


@app.post("/api/auth/login", response_model=db.Token)
def login(payload: db.UserLogin):
    user = db.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "user": db.public_user(user)}


@app.get("/api/auth/me", response_model=db.UserOut)
def me(user: dict = Depends(get_current_user)):
    return db.public_user(user)


@app.get("/api/history", response_model=list[db.ConversionOut])
def history(user: dict = Depends(get_current_user)):
    return db.get_history(str(user["_id"]))


@app.post("/convert-pdf")
@app.post("/api/convert")
async def convert(payload: db.ConvertRequest, user: dict = Depends(get_current_user)):
    plan = user.get("plan", "free")
    used = user.get("pdf_count", 0)
    if plan == "free" and used >= FREE_PLAN_LIMIT:
        raise HTTPException(
            status_code=402,
            detail=(
                f"You have used all {FREE_PLAN_LIMIT} free PDFs this cycle. "
                "Upgrade to Pro for unlimited conversions."
            ),
        )

    url = validate_public_url(payload.url)

    try:
        pdf_bytes = await render_pdf(url, clean=payload.clean)
    except PlaywrightError as exc:
        message = str(exc).splitlines()[0] if str(exc).strip() else "Browser error."
        raise HTTPException(
            status_code=502,
            detail=f"Could not render this page as PDF. {message}",
        )
    except Exception:
        raise HTTPException(
            status_code=500, detail="Something went wrong while creating the PDF."
        )

    if not pdf_bytes:
        raise HTTPException(status_code=502, detail="The page returned an empty PDF.")

    db.increment_usage(str(user["_id"]), url)

    site = urlparse(url).hostname or "page"
    filename = f"{site.replace('.', '-')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}",
            "X-PDF-Count": str(used + 1),
        },
    )
