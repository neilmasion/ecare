# eCare - Modern Community Assistance & Public Services Platform

> Full-stack civic portal built with **React 18 (Vite)**, **Tailwind CSS**, **Python Django (DRF)** REST backend, and **Neon PostgreSQL** cloud database.

---

## 🌟 Highlights & Architecture

- **Frontend**: **React 18 + Vite + Tailwind CSS + React Router v6**
  - Fully styled using modern **Tailwind CSS** utility classes and custom design tokens.
  - Route-level code splitting (`React.lazy` + `Suspense`) with custom loading skeletons.
  - Multi-step Assistance Application form with progress bar and instant validation.
  - Interactive Service Catalog with category filters, debounced search, and detailed modal popup.
  - Live Reference Tracking (`CC-2026-XXXX`) with 4-step real-time status stepper.
  - Resident Account Authentication (Sign In / Sign Up tabs with live password strength meter).
  - Authenticated Resident Dashboard displaying personal applications.
  - Citizen Privacy Policy (`/privacy`), Terms of Service (`/terms`), and Cookie Consent banner.

- **Backend**: **Python Django 5 + Django REST Framework**
  - Modular RESTful API architecture (`/api/services/`, `/api/assistance/`, `/api/contact/`, `/api/auth/`).
  - Rate limiting / Throttling on anonymous users, authenticated users, auth endpoints, and submissions.
  - Automatic unique reference number generator (format `CC-YYYY-XXXX`).
  - In-memory response caching + GZip payload compression.
  - Built-in Django Admin portal with customizable admin URL.
  - N+1 query elimination via `select_related('user', 'user__profile')`.

- **Database**: **Neon PostgreSQL**
  - Configured with `dj-database-url` and modern `psycopg 3` (binary).
  - Native SSL encryption support (`sslmode=require`) and connection pooling (`conn_max_age=600`).
  - Indexes on critical query fields (`reference_number`, `status`, `category`, `email`, `created_at`).
  - Automatic fallback to local SQLite (`db.sqlite3`) if `DATABASE_URL` is empty.

---
