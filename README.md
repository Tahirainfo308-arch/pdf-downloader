# PDFly — Web page to PDF SaaS

A full-stack PDF downloader: paste any public URL and get a high-quality A4 PDF
rendered by a real Chromium browser. Includes JWT auth, usage tracking and a
modern React landing page with pricing.

## Stack

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend  | Python + FastAPI               |
| PDF      | Playwright (Chromium)          |
| Database | MongoDB (PyMongo)              |
| Auth     | JWT (python-jose) + bcrypt     |

## Project structure

```
pdf-converter-saas/
├── backend/
│   ├── app.py            # FastAPI routes, auth, PDF conversion
│   ├── database.py       # Mongo connection + Pydantic schemas
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/   # Navbar, Footer, Features, Pricing, ...
    │   ├── context/      # AuthContext
    │   ├── pages/        # Home, Login, Signup, Dashboard
    │   ├── api.js
    │   └── App.jsx
    ├── package.json
    ├── tailwind.config.js
    └── .env.example
```

## 1. Backend setup

Requirements: Python 3.10+ and a running MongoDB instance
(local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
playwright install
Copy-Item .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=pdf_saas
JWT_SECRET=put-a-long-random-string-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
FREE_PLAN_LIMIT=5
```

Run the API:

```powershell
uvicorn app:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## 2. Frontend setup

Requirements: Node.js 18+.

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173

## Deploy on Vercel (Services)

The root `vercel.json` deploys this repository as one Vercel project with two
services:

- `frontend/` — Vite + React, served at `/`
- `backend/` — FastAPI (`app:app`), served at `/api/*` and `/convert-pdf`

Import the repository in Vercel, leave the root directory empty, set the
Framework Preset to **Services** if Vercel does not detect it automatically, and
add these environment variables for Production, Preview, and Development:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string (`mongodb+srv://...`). Local `mongodb://localhost` will not work on Vercel. |
| `DB_NAME` | Yes | Database name, for example `pdf_saas`. |
| `JWT_SECRET` | Yes | Long random secret used to sign JWTs. |
| `SECRET_KEY` | No | Alternate name accepted when `JWT_SECRET` is not set. |
| `FRONTEND_URL` | Yes | Production site URL, for example `https://pdf-downloader.vercel.app`. |
| `CORS_ORIGINS` | No | Extra comma-separated origins allowed by CORS. |
| `FREE_PLAN_LIMIT` | No | Free conversions per account (default `5`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token lifetime in minutes (default `10080`). |

Do not set `VITE_API_URL` on Vercel. The production frontend calls the
same-origin `/api` routes, which Vercel proxies to the backend service.

After the first deploy, set `FRONTEND_URL` to the final production URL and
redeploy. The site will be at `https://<project>.vercel.app` and the API at
`https://<project>.vercel.app/api`.

> **PDF rendering note:** Playwright needs a Chromium binary. Vercel Functions
> do not include one by default, so `/api/convert` may return a browser error
> after deployment. If that happens, deploy `backend/` as a container service
> with `playwright install --with-deps chromium`, or run the backend on a host
> that includes Chromium.

## API endpoints

| Method | Path               | Auth | Description                          |
| ------ | ------------------ | ---- | ------------------------------------ |
| POST   | `/api/auth/signup` | No   | Create account, returns JWT          |
| POST   | `/api/auth/login`  | No   | Log in, returns JWT                  |
| GET    | `/api/auth/me`     | Yes  | Current user profile + usage         |
| GET    | `/api/history`     | Yes  | Last 20 conversions                  |
| POST   | `/api/convert`     | Yes  | `{ "url": "...", "clean": true }` → PDF |
| POST   | `/convert-pdf`     | Yes  | Alias of `/api/convert`              |

## How it works

1. User pastes a URL on the landing page (or dashboard).
2. The frontend sends it with a Bearer token to `POST /api/convert`.
3. FastAPI validates the URL (http/https only, blocks private/internal hosts to
   prevent SSRF), loads it in headless Chromium via Playwright and prints the
   page to A4.
4. **Clean print mode** (on by default) injects CSS that hides navbars, ads,
   cookie banners and sidebars before printing, so the PDF reads like a clean
   article. Users can toggle it in the dashboard.
5. The PDF is streamed back and the user's `pdf_count` is incremented.
6. Free accounts are limited to `FREE_PLAN_LIMIT` conversions; the dashboard
   shows remaining usage, history and an upgrade prompt.

## Demo checkout

The pricing cards and dashboard "Upgrade to Pro" button open a Stripe-style
**test-mode checkout modal**. It is pre-filled with the `4242 4242 4242 4242`
test card, simulates payment and upgrades the local user plan so you can demo
the full funnel. No card data is sent or stored anywhere.

## Notes / next steps

- The checkout is a UI mock only. Connect Stripe Checkout/Webhooks and a
  `/api/billing` route to persist real plans server-side.
- For production, run behind HTTPS, use a strong `JWT_SECRET`, restrict CORS to
  your real domain and consider a job queue for heavy render loads.
- Playwright needs browsers installed on the host (`playwright install`, plus
  `--with-deps` on Linux servers).
