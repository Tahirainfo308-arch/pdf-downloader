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
MONGO_URL=mongodb://localhost:27017
DB_NAME=pdf_saas
JWT_SECRET=put-a-long-random-string-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
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
