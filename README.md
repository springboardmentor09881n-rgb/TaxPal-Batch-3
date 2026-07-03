# TaxPal — Infosys Intern Project

Personal Finance & Tax Estimator for Freelancers (Angular + MongoDB).

## Project structure

```
infosys intern project/
├── taxpal-frontend/   # Angular 19 app (landing, login, signup)
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

## Pages implemented (Milestone 1 - partial)

- **Landing page** (`/`) — hero, features, how-it-works, CTA
- **Login** (`/login`) — email/password authentication
- **Sign up** (`/signup`) — registration with name, email, password, country, income bracket

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/validate` | Validate JWT and return user |
| GET | `/api/auth/me` | Get current user (Bearer token) |

## Next milestones

- Income/expense input forms
- Dashboard with transactions
- Budgeting, tax estimation, reports
