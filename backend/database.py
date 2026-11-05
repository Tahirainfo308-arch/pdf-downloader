import os
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "pdf_saas")

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

users = db["users"]
conversions = db["conversions"]

try:
    users.create_index("email", unique=True)
    conversions.create_index([("user_id", 1), ("created_at", -1)])
except Exception as exc:  # Mongo may not be running yet during local setup
    print(f"[db] Could not create indexes: {exc}")


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    plan: str
    pdf_count: int
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ConvertRequest(BaseModel):
    url: str = Field(min_length=4, max_length=2048)
    clean: bool = True


class ConversionOut(BaseModel):
    id: str
    url: str
    created_at: datetime


def public_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "plan": doc.get("plan", "free"),
        "pdf_count": doc.get("pdf_count", 0),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
    }


def get_user_by_email(email: str) -> Optional[dict]:
    return users.find_one({"email": email.lower()})


def get_user_by_id(user_id: str):
    from bson import ObjectId

    if not ObjectId.is_valid(user_id):
        return None
    return users.find_one({"_id": ObjectId(user_id)})


def create_user(name: str, email: str, hashed_password: str) -> dict:
    doc = {
        "name": name.strip(),
        "email": email.lower(),
        "hashed_password": hashed_password,
        "plan": "free",
        "pdf_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def increment_usage(user_id: str, url: str) -> None:
    from bson import ObjectId

    users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"pdf_count": 1}})
    conversions.insert_one(
        {
            "user_id": user_id,
            "url": url,
            "created_at": datetime.now(timezone.utc),
        }
    )


def get_history(user_id: str, limit: int = 20) -> list[dict]:
    docs = (
        conversions.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    return [
        {
            "id": str(d["_id"]),
            "url": d["url"],
            "created_at": d["created_at"],
        }
        for d in docs
    ]
