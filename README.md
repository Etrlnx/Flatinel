# Flatinel — Society Maintenance Tracker

A modern, full-stack apartment society maintenance platform built for **Unthinkable Solutions**. The application enables residents to report, track, and monitor maintenance issues with photo evidence, provides administrators with priority triaging and status management with immutable audit trails, surfaces overdue complaints based on a configurable SLA, and keeps everyone informed via a pinned notice board and automated email updates.

---

## Key Features

### Resident Portal
- **User Authentication**: Secure registration and login with JWT and bcrypt password hashing.
- **Complaint Submission**: Raise maintenance issues with title, category (*Plumbing, Electrical, Carpentry, Appliance, Common Area, Security, Other*), location/unit, description, and optional photo attachment.
- **Live Status & Audit History**: Track complaints across the lifecycle (*Open &rarr; In Progress &rarr; Resolved*) with full timestamped history logs and administrative notes.
- **Notice Board**: View announcements from society management with pinned urgent notices highlighted.

### Admin Management Portal
- **Interactive Dashboard**: Real-time KPI cards for total complaints, breakdown by status (*Open, In Progress, Resolved*), overdue issue counts, and category distributions.
- **Complaint Triage & Filtering**: Filter maintenance registry by category, status, date range, or free-text search.
- **Priority & Status Workflow**: Assign priorities (*Low, Medium, High*) and transition statuses with timestamped actor logging and optional context notes.
- **Auto-Closing**: Marking a complaint as *Resolved* closes the issue and locks further status mutations.
- **Dynamic Overdue Detection**: Open complaints exceeding a configurable threshold (e.g. 3 days) are flagged as **OVERDUE** and automatically prioritized at the top of the queue.
- **Dynamic Overdue Configuration**: Administrators can customize the overdue threshold in days directly from the UI.
- **Notice Board & Announcements**: Publish notices with an optional *Important / Pinned* flag that broadcasts automated email notifications to all active residents.

### Notifications & Storage
- **Asynchronous Email Updates**: Background tasks dispatch emails to residents on complaint status changes and when important notices are published (supports SMTP or mock logging mode).
- **Photo Upload Handling**: Safe multipart file upload with MIME-type validation, size limits (max 5MB), and unique UUID filenames.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Python 3.10+, **FastAPI**, Uvicorn, Pydantic v2, Pydantic-Settings |
| **Database & ORM** | **SQLAlchemy ORM**, SQLite (zero-setup default) / PostgreSQL ready |
| **Auth & Security** | JWT (PyJWT), Passlib (Bcrypt), OAuth2 Bearer Tokens |
| **Frontend SPA** | **React 18**, **Vite**, **Tailwind CSS**, Lucide Icons, Axios, React Router v6 |
| **Testing** | **Pytest**, FastAPI TestClient, HTTPX |

---

## One-Command Quickstart (Unified Run)

You can launch both the **FastAPI backend** and the **React frontend** simultaneously with a single command from the project root:

```bash
# Option A: Using Python (Recommended)
python run.py

# Option B: Using npm
npm run dev
```

Both options will start:
- 🔹 **Frontend Application**: `http://localhost:5173`
- 🔹 **Backend API & Swagger Docs**: `http://127.0.0.1:8000/docs`

---

## Manual Quickstart Guide

### Prerequisites
- Python 3.10 or higher
- Node.js v18+ and npm

---

### 1. Backend Setup

1. Open a terminal in the project root:
   ```bash
   cd d:\git_repos\flatinel
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. *(Optional)* Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```

5. Start the FastAPI server (tables and seed data are automatically initialized on startup):
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   The backend API will be running at `http://127.0.0.1:8000`.  
   Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application UI will be running at `http://localhost:5173`.

---

## Pre-Seeded Demo Accounts

For immediate evaluation, the database is pre-seeded with sample users, complaints, and notices:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@society.com` | `admin123` | Full administrative triage access |
| **Resident** | `alice@example.com` | `resident123` | Flat 402, Block A (has active & overdue complaints) |
| **Resident** | `bob@example.com` | `resident123` | Flat 205, Block B (has resolved complaints) |

*Tip: The login page also includes **One-Click Demo Access** buttons for instant sign-in.*

---

## Running Automated Tests

Run the Pytest suite to verify authentication, complaint status transitions, overdue computation, notices, and settings:

```bash
# From project root with virtualenv active:
pytest
```

Build the frontend bundle to ensure zero compiler or JSX errors:
```bash
cd frontend
npm run build
```

---

## Repository Structure

```
flatinel/
├── backend/
│   ├── app/
│   │   ├── models/            # User, Complaint, ComplaintStatusHistory, Notice, AppSetting
│   │   ├── schemas/           # Pydantic request/response validation models
│   │   ├── routers/           # Auth, Complaints, Notices, Dashboard, Settings
│   │   ├── services/          # JWT Auth service & Async Email Dispatcher
│   │   ├── utils/             # File upload sanitization & Database seeder
│   │   ├── config.py          # Application configuration
│   │   ├── database.py        # SQLAlchemy engine & sessionmaker
│   │   └── main.py            # FastAPI entrypoint, middleware, static mounts
│   ├── tests/                 # Pytest automated test suite
│   ├── uploads/               # Local photo uploads storage
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios API client & endpoints
│   │   ├── components/        # Timeline, Badges, Modals, Navbar
│   │   ├── context/           # AuthContext & state provider
│   │   ├── pages/             # Login, Register, Resident & Admin Portals, NoticeBoard
│   │   ├── App.jsx            # Routing & role-based route guard
│   │   └── main.jsx           # React DOM mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   ├── system_design.md       # System design write-up (max 800 words)
│   ├── api_docs.md            # Comprehensive API reference
│   └── database_schema.md     # ER diagram & table specifications
├── tasklist.md                # Master tracking task list
├── knowledge_graph.json       # Project knowledge graph with resolved decisions
└── README.md                  # Master documentation
```

---

## Documentation Deliverables

- **[System Design Write-Up](docs/system_design.md)**: 800-word design report covering the complaint history model, overdue detection engine, photo evidence pipeline, and asynchronous notification architecture.
- **[API Documentation](docs/api_docs.md)**: Exhaustive endpoint documentation with request/response schemas.
- **[Database Schema](docs/database_schema.md)**: Complete ER diagram and column specifications.

---
