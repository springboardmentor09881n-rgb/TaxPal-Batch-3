# TaxPal — Personal Finance & Tax Estimator for Freelancers

> A full-stack web application that helps freelancers and gig workers manage income, track expenses, set budgets, and prepare for tax season — all in one place.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Milestones](#milestones)
- [Screenshots](#screenshots)
- [Security](#security)
- [Contributing](#contributing)

---

## Overview

TaxPal is designed for the modern freelancer who juggles multiple income streams, variable expenses, and quarterly tax obligations. It provides a clean, intuitive interface for logging every dollar in and out, organizing transactions by category, setting monthly spending budgets, and getting a clear picture of financial health — month by month.

**Implemented Modules (Milestones 1 & 2):**
- Module A — Income & Expense Management
- Module B — Categorization & Budgeting

---

## Features

### Module A — Income & Expense Management
- **Secure authentication** — Email/password sign-up and sign-in via Supabase Auth; sessions persist across page reloads
- **Transaction logging** — Record income and expenses with description, amount, date, category, and optional notes
- **Real-time dashboard** — Month-over-month stat cards for income, expenses, and net income with percentage change indicators
- **6-month bar chart** — Visual comparison of income vs. expenses across the last 6 months with hover tooltips
- **Recent transactions list** — Quick-glance view of the latest activity on the dashboard
- **Search & filter** — Full-text search and type-based filtering (all / income / expense) on the Transactions page
- **Delete with confirmation** — Safe deletion flow for any transaction

### Module B — Categorization & Budgeting
- **Custom categories** — Create unlimited income and expense categories, each with a custom color
- **Monthly budgets** — Set a spending limit per expense category for the current month
- **Budget progress bars** — Visual progress bars that turn amber at 80% and red when over budget
- **Over-budget alerts** — Clear callouts showing exactly how much over the limit spending has gone
- **Spending by category** — Dashboard breakdown panel showing top expense categories and their share of total spending
- **Total budget summary** — Aggregate view of all budgets combined with a single progress bar
- **Profile management** — Update name, country, and income bracket in Settings

---
