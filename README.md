# TaxPal-Batch-3

Personal Finance & Tax Estimator for Freelancers (Angular + Express + MongoDB).

## Project structure

```
infosys intern project/
├── taxpal-frontend/   # Angular 19 SPA
└── taxpal-backend/    # Express API + MongoDB
```

## Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## Setup & run

### 1. Start MongoDB

Make sure MongoDB is installed and running locally. The backend uses database: `taxpal`.

### 2. Backend API

```bash
cd "D:\infosys intern project\taxpal-backend"
cp .env.example .env   # edit JWT_SECRET if needed
npm install
npm start
```

API runs at: `http://localhost:3000`

### 3. Frontend

```bash
cd "D:\infosys intern project\taxpal-frontend"
npm install
npm start
```

App runs at: `http://localhost:4200`

## Features implemented

| Module | Description |
|--------|-------------|
| **Auth** | Register, login, JWT session, route guards |
| **Transactions** | Income/expense logging, edit, auto category suggestions |
| **Dashboard** | Monthly summary, charts, recent transactions, alerts |
| **Budgets** | Category limits with visual progress bars |
| **Categories** | Suggested categories DB + management screen |
| **Alerts** | Tax due reminders and budget warnings |
| **Tax Engine** | Regional tax slabs (India, US, UK), quarterly calendar |
| **Reports** | Monthly/quarterly summaries with CSV + PDF export |

## Pages

- **Landing** (`/`) — marketing page with features and CTA
- **Login** (`/login`) — email/password authentication
- **Sign up** (`/signup`) — registration with country and income bracket
- **Dashboard** (`/dashboard`) — full finance hub with 7 tabs

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/validate` | Validate JWT |
| GET | `/api/dashboard` | Dashboard summary (auth) |
| GET/POST/DELETE | `/api/transactions` | Transaction CRUD |
| GET/POST/DELETE | `/api/budgets` | Budget management |
| GET/POST | `/api/tax/*` | Tax estimates and calendar |
| GET | `/api/reports/summary` | Generate report summary |
| GET | `/api/categories` | Manage suggested categories |
| GET/PATCH | `/api/alerts` | Alerts and reminders |
| GET | `/api/reports/history` | Saved report history |
| GET | `/api/reports/export?format=csv\|pdf` | Download CSV or PDF report |

## Database collections

- **Users** — name, email, password, country, income_bracket
- **Transactions** — type, category, amount, date, description
- **Budgets** — category, limit, month
- **TaxEstimates** — quarter, fiscalYear, estimatedTax, taxableIncome
- **Reports** — period, report_type, file_path, format, summary
- **SuggestedCategories** — name, type, description
- **Alerts** — type, message, alertDate, isRead
