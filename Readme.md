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

## 📁 Project Structure

```text
Ecare/
├── backend/                        # Django REST API Backend
│   ├── manage.py
│   ├── requirements.txt            # Django, DRF, psycopg, dj-database-url, cors-headers
│   ├── .env.example                # Environment template with security & pooling flags
│   ├── .env                        # Active environment variables
│   ├── gunicorn.conf.py            # Production load balancer & worker concurrency config
│   ├── ecare_backend/              # Django project settings and routing
│   │   ├── settings.py             # Security headers, cookies, throttling, cache, Neon pooling
│   │   ├── urls.py                 # Custom admin URL and API routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── api/                        # Main Django application
│       ├── models.py               # Indexed models with FileExtension & FileSize validators
│       ├── serializers.py          # Input sanitization, password omission, validation
│       ├── views.py                # Cached queries, rate throttles, select_related
│       ├── urls.py                 # API endpoints
│       ├── admin.py                # Django Admin customizations
│       └── management/commands/
│           └── seed_data.py        # Automatic database population
│
├── frontend/                       # React Frontend (Vite + Tailwind CSS)
│   ├── package.json
│   ├── vite.config.js              # Code chunk splitting (vendor-react, vendor-utils)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html                  # Preconnect, DNS prefetch, Lighthouse meta tags
│   ├── public/images/              # 98.6% compressed images (1.2MB total)
│   └── src/
│       ├── api/client.js           # Axios client with 3-minute in-memory cache & CSRF
│       ├── hooks/useDebounce.js    # Reusable 300ms debounce hook
│       ├── context/AuthContext.jsx # Authentication state provider
│       ├── components/             # Reusable UI components
│       │   ├── Navbar.jsx          # Clean civic navbar
│       │   ├── Footer.jsx          # Footer with hotlines & legal links
│       │   ├── ServiceModal.jsx    # Service requirements & details modal
│       │   ├── Skeleton.jsx        # Shimmer loading skeletons
│       │   ├── CookieConsent.jsx   # Interactive cookie consent banner
│       │   └── ScrollToTop.jsx
│       └── pages/                  # Lazy-loaded views
│           ├── Home.jsx            # Hero, quick tracker, 3-step process, FAQ
│           ├── Services.jsx        # Catalog with debounced search & skeleton loading
│           ├── Assistance.jsx      # 3-step wizard with file upload & confetti
│           ├── TrackStatus.jsx     # Live reference tracker with 4-step timeline
│           ├── About.jsx           # Mission, values, team & lazy loaded avatars
│           ├── Contact.jsx         # Helpdesk form (500 char count) & hotline cards
│           ├── Account.jsx         # Auth tabs with password strength indicator
│           ├── Dashboard.jsx       # Resident application history with skeleton rows
│           ├── PrivacyPolicy.jsx   # Data Privacy Act compliance notice
│           └── TermsOfService.jsx  # Citizen charter & usage terms
│
├── nginx.conf                      # Production reverse proxy, SSL, upstream cluster, gzip
├── package.json                    # Single-command runner (concurrently)
├── run_servers.ps1                 # PowerShell single-command launcher
├── start.bat                       # Windows double-click launcher
└── README.md                       # Complete documentation
```

---

## 🔒 24 Essential Website Security Checklist Implementation

| # | Security Item | Implementation in eCare |
|---|---|---|
| **1** | **Hide API Keys** | All secrets and credentials read from `.env` via `python-dotenv`. Zero hardcoded secrets in source code. |
| **2** | **Check env variables** | Full template provided in `backend/.env.example`. |
| **3** | **Check keys in git** | Root `.gitignore` strictly ignores `.env`, `*.sqlite3`, `media/`, `node_modules/`, `dist/`. |
| **4** | **Protect admin routes** | Configurable `DJANGO_ADMIN_URL` from env (obfuscated from standard `/admin/`). Restricted to authenticated staff. |
| **5** | **Add auth** | Django session + PBKDF2 SHA-256 password hashing; registration, login, logout, and session check endpoints. |
| **6** | **Check user perms** | Object-level query isolation: residents can only access their own assistance applications (`user=request.user`). |
| **7** | **Sanitize user inputs** | DRF serializers sanitize all text with `re.sub` script stripping and `html.escape`. Length limits enforced. |
| **8** | **Protect against XSS** | React JSX auto-escaping, `SECURE_BROWSER_XSS_FILTER = True`, `X-Content-Type-Options = 'nosniff'`. |
| **9** | **SQL injection protect** | Parameterized Django ORM exclusively (`filter()`, `get()`, `select_related()`). No raw SQL string formatting. |
| **10** | **Check DB rules** | Unique constraints (`reference_number`, `slug`, `username`, `email`), choices validation, database-level indexes. |
| **11** | **Add rate limiting** | DRF `ScopedRateThrottle` (`auth`: 10/min, `submit`: 15/min) and user/anon rate throttles (`60-120/min`). |
| **12** | **Set spend cap / limits** | `DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880` (5MB), Neon compute autosuspend configuration documented. |
| **13** | **Secure file uploads** | `FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png'])`, `validate_file_size` (<= 5MB), UUID randomized paths. |
| **14** | **CSRF protection** | Django `CsrfViewMiddleware` active; `CSRF_COOKIE_SAMESITE = 'Lax'`. |
| **15** | **Check CORS settings** | `django-cors-headers` with explicit `CORS_ALLOWED_ORIGINS` (no wildcards `*` with credentials). |
| **16** | **Enable HTTPS** | `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS = 31536000`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`. |
| **17** | **Add security headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| **18** | **Secure cookies** | `SESSION_COOKIE_HTTPONLY = True`, `SESSION_COOKIE_SAMESITE = 'Lax'`, `SESSION_COOKIE_SECURE = not DEBUG`. |
| **19** | **Disable debug mode** | `DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1')` (defaults to `False` in production). |
| **20** | **Check production settings** | `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')`, `ALLOWED_HOSTS` validation. |
| **21** | **Add privacy policy** | Dedicated `/privacy` page detailing Data Privacy Act compliance, data retention, citizen rights. |
| **22** | **Add cookie consent** | Interactive floating banner with Accept / Essential options, preference stored in `localStorage`. |
| **23** | **Add terms of services** | Dedicated `/terms` page outlining citizen charter, document validity, fraud policies. |
| **24** | **No expose of user data** | `UserSerializer` strictly limits fields to safe public attributes; passwords and permissions never returned. |

---

## ⚡ 20 Performance Optimization Checklist Implementation

| # | Performance Item | Implementation in eCare |
|---|---|---|
| **1** | **Compress images** | Reduced raw images from **89MB down to 1.2MB** (98.6% reduction) via Pillow Lanczos resampling & JPEG optimization. |
| **2** | **Add lazy loading** | `loading="lazy"` on all `<img>` tags; route-level `React.lazy()` with `<Suspense>` on all pages. |
| **3** | **Split code into chunks** | Vite `manualChunks` in `vite.config.js` (`vendor-react`, `vendor-utils`, and individual page chunks). |
| **4** | **Cache API responses** | Django `LocMemCache` caching `/api/services/`, `/api/faqs/`, `/api/testimonials/`, and `/api/stats/` + 3-min in-memory client cache. |
| **5** | **Add CDN** | Cache-Control headers (`max-age=31536000, immutable`), CDN-ready static asset mapping. |
| **6** | **Minify JS and CSS** | Vite production minification via `esbuild`, Tailwind CSS minification enabled (`cssMinify: true`). |
| **7** | **Index the database** | Added `db_index=True` and compound indexes on `AssistanceRequest`, `Service`, `ContactMessage`, `FAQ`. |
| **8** | **Reduce re-renders** | Granular component hierarchy, debounced search states, memoized modal callbacks. |
| **9** | **Debounce input handlers** | Custom `useDebounce` hook (300ms delay) on catalog search and tracking inputs. |
| **10** | **Paginate large lists** | DRF `StandardResultsPagination` (default 9 items/page, max 50) on services and history. |
| **11** | **Remove unused dependencies** | Trimmed package.json files down to essential production libraries only. |
| **12** | **Defer non-critical scripts** | Google Fonts loaded with `display=swap`, script tags set to `type="module"` (deferred). |
| **13** | **Add loading skeletons** | `ServiceCardSkeleton`, `DashboardRowSkeleton`, and `PageLoadingSkeleton` shimmer placeholders. |
| **14** | **Add load balancer** | Gunicorn configuration `backend/gunicorn.conf.py` (multi-worker + threads) and Nginx upstream cluster in `nginx.conf`. |
| **15** | **Compress API payloads** | `django.middleware.gzip.GZipMiddleware` automatically compresses all JSON API payloads. |
| **16** | **DB connection pooling** | `conn_max_age=600` and `conn_health_checks=True` in `dj-database-url` for Neon connection pooling. |
| **17** | **Cache expensive queries** | Low-level `cache.get_or_set` for community statistics, FAQs, and active services. |
| **18** | **N+1 database queries** | `select_related('user', 'user__profile')` on `AssistanceRequest` querysets to execute single SQL JOINs. |
| **19** | **Server-side caching** | Django cache framework with automatic invalidation when applications are created. |
| **20** | **Lighthouse audit** | Proper meta viewport, description, theme-color, nosniff, explicit image dimensions, and aria-labels. |

---

## 🚀 Running the App (1 Single Command)

From the project root:

```bash
npm run dev
```

- **React App**: `http://localhost:5173/`
- **Django API**: `http://127.0.0.1:8000/api/`
- **Django Admin**: `http://127.0.0.1:8000/admin/` *(Default: `admin` / `admin123`)*
