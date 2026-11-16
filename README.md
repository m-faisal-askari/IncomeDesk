# IncomeDesk

<p align="center">
  <img src="frontend/public/IncomeDesk_Logo_Transparent.svg" alt="IncomeDesk" width="360" />
</p>

IncomeDesk is a financial operations workspace for independent contractors and self-employed professionals.

It brings invoices, project profitability, multi-currency conversions, internal transfers, tax reserves, and budgets into one ledger, with monetary calculations handled by a Python `Decimal` engine.

---

## 1. System Architecture

```
               ┌────────────────────────────────────────────────────────┐
               │                    REACT + VITE SPA                    │
               │  Tailwind CSS • TanStack Query • Recharts • Lucide     │
               └──────────────────────────┬─────────────────────────────┘
                                          │ REST API (/api/v1)
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │                    FASTAPI BACKEND                     │
               │      Supabase Auth (verified user access JWTs)         │
               └──────────┬─────────────────────────────────┬───────────┘
                          │                                 │
                          ▼                                 ▼
         ┌─────────────────────────────────┐   ┌────────────────────────┐
         │   FINANCIAL CALCULATION ENGINE  │   │  REPORTLAB PDF ENGINE  │
         │ Exact Decimal (ROUND_HALF_UP)   │   │ Invoice & P&L PDFs     │
         └────────────────┬────────────────┘   └────────────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────────────────────────────────┐
         │              POSTGRESQL / SQLITE ORM ENGINE                 │
         │   SQLAlchemy 2.0 • Alembic Migrations • Strict Multi-Tenant  │
         └─────────────────────────────────────────────────────────────┘
```

### Core Product & Accounting Principles
1. **Invoice Issuance ≠ Cash Received**: Issuing an invoice creates an Accounts Receivable record, but never inflates received income until settled.
2. **Atomic Payment Settlements**: Recording invoice payments atomically settles invoice balance due and writes a confirmed `INCOME` ledger entry to the designated account.
3. **Internal Transfers Net to Zero**: Transfers between user-owned accounts move liquidity without distorting income, expenses, or net cash flow.
4. **Authoritative Python Decimal Arithmetic**: No monetary calculations rely on JavaScript floating-point arithmetic.
5. **Multi-Currency Rate Preservation**: Multi-currency transactions snapshot exchange rates on the transaction date so historical financial reports are immune to exchange-rate drift.
6. **Proactive Estimated Tax Withholding**: Live calculation of taxable profit multiplied by jurisdiction reserve targets prevents year-end tax surprises.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query v5, Recharts, Lucide React, React Router v6.
- **Backend**: Python 3.14+, FastAPI, Pydantic v2, SQLAlchemy 2.0, ReportLab 5, Pandas, Alembic.
- **Database**: PostgreSQL (Supabase ready) / SQLite fallback for lightweight local dev and testing.
- **Testing**: Pytest (backend unit + acceptance scenario), Vitest (frontend components).

---

## 3. Directory Layout

```
.
├── backend/
│   ├── alembic/                # Database migrations (autogenerate versions)
│   ├── app/
│   │   ├── api/v1/             # REST Routers (dashboard, txs, invoices, taxes, etc.)
│   │   ├── core/               # Configuration, security, database session
│   │   ├── engine/             # Decimal calculations & currency conversion engine
│   │   ├── models/             # SQLAlchemy relational models
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── utils/              # ReportLab invoice & P&L PDF generation
│   │   ├── main.py             # FastAPI entrypoint
│   │   └── seed.py             # Realistic development seed script
│   ├── tests/
│   │   ├── test_acceptance_scenario.py   # Mandatory Section 13 financial test
│   │   └── test_api_endpoints.py         # End-to-end API integration tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js       # TanStack Query & Fetch client
│   │   ├── components/         # Reusable UI system (MetricCard, Modal, Badge, etc.)
│   │   ├── layouts/            # MainLayout with persistent sidebar & topnav
│   │   ├── pages/              # 12 integrated module pages
│   │   └── utils/formatters.js # Currency and date formatters
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── alembic.ini
└── README.md
```

---

## 4. Getting Started Locally

### Prerequisites
- Python 3.11+ (Python 3.14 recommended)
- Node.js 18+ and npm

### 1. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend\requirements.txt

# Run database migrations
$env:PYTHONPATH="."
alembic upgrade head

# (Optional) Seed realistic demo data
python backend\app\seed.py

# Start the FastAPI backend server
python -m uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be live at: `http://127.0.0.1:8000/api/v1/docs`

### 2. Frontend Setup
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

Open `http://localhost:5173/demo` to explore the sample workspace without signing in. The demo initializes its example user and four months of financial activity the first time it is opened.

---

## 5. Automated Testing

### Backend Tests (Pytest)
Runs the mandatory acceptance test scenario and end-to-end API verification:
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\pytest -v backend\tests\
```

#### Acceptance Scenario Verified:
- Opening balance: $1,000.
- Confirmed income: $2,000.
- Confirmed expenses: $500.
- Transfer between two owned accounts: $200.
- Result: Net Cash Flow = +$1,500, Account Consolidated Balance = $2,500, Transfer has $0.00 effect on income/expenses.

### Frontend Tests (Vitest)
```powershell
cd frontend
npm run test -- --run
```

### Production Build
```powershell
cd frontend
npm run build
```

---

## 6. Supabase & Production Deployment

1. **Supabase PostgreSQL & Auth**:
   - Create a Supabase project.
   - Copy connection string into `DATABASE_URL` in `.env`:
     `DATABASE_URL=postgresql+psycopg2://postgres:<password>@db.<ref>.supabase.co:5432/postgres`
   - Set `SUPABASE_URL` to the project URL. The backend validates Supabase JWT signatures, issuer, and audience using the project's JWKS.
   - For projects still using legacy HS256 signing, set `SUPABASE_JWT_SECRET` in the backend environment. Leave it unset for asymmetric signing keys.
   - Keep `DEV_AUTH_ENABLED=False` in production. Email/password and Google sign-in both use this same Supabase Auth project; there is no separate backend password account path.
   - The latest migration clears legacy backend SHA-256 password hashes. Signing in to Supabase with the same email links to the existing local account ID and its financial records.
   - Run `alembic upgrade head` to apply all migrations to Supabase.
2. **Backend Hosting (Render / Railway)**:
   - Build Command: `pip install -r backend/requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - Environment variable: `FRONTEND_URL=https://your-frontend-domain.com`
3. **Backend Hosting (Fly.io)**:
   - From the repository root, authenticate with `fly auth login` and deploy with `fly deploy`.
   - `fly.toml` targets the existing `patient-fern-1718` API in Singapore, builds the backend-only root `Dockerfile`, serves port `8080`, and checks `/health`.
   - The Fly app exposes the API and docs only. The React frontend is hosted separately on Vercel.
   - `FRONTEND_URL` is set to `https://incomedesk.vercel.app` for CORS.
   - Set `DATABASE_URL` to the production PostgreSQL connection string and configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `DEV_AUTH_ENABLED=False` as Fly secrets. Configure `SUPABASE_JWT_SECRET` only for Supabase projects that still use HS256 signing.
   - The Fly release command applies Alembic migrations once before the new Machines receive traffic. Keep production credentials in Fly secrets; do not commit them to this repository.
4. **Frontend Hosting (Vercel / Cloudflare Pages)**:
   - Root directory: `frontend`
   - Build Command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_URL=https://your-backend-domain.com` and `VITE_SITE_URL=https://your-frontend-domain.com`
   - For this deployment, set `VITE_API_URL=https://patient-fern-1718.fly.dev` and `VITE_SITE_URL=https://incomedesk.vercel.app` in Vercel project settings.
   - Copy `frontend/.env.example` to `frontend/.env` and set the URLs for local configuration. Configure the matching `FRONTEND_URL` in the backend environment for CORS.

---

## 7. License
Proprietary & Confidential. Designed for independent freelancers.
