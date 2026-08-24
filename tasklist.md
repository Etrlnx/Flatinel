# Society Maintenance Tracker — Master Task List

Source docs: `Society_Maintenance_Tracker.pdf` (problem statement) + `Assignment_Submission_Usage_Guidelines.pdf` (submission rules).

---

## ⚠️ 0. Architectural Decisions Resolved

| # | Decision Point | Chosen Implementation |
|---|---|---|
| 1 | Tech stack | **FastAPI** (Python 3.10+) + **React (Vite + Tailwind CSS)** + **SQLAlchemy ORM** (SQLite / PostgreSQL) |
| 2 | Photo storage | Validated multi-part file upload with UUID hashing and `/uploads` static file mount |
| 3 | Email provider | Asynchronous background dispatcher supporting SMTP (Gmail/Brevo/SendGrid) with graceful mock fallback |
| 4 | Overdue threshold config | Admin-editable database setting table (`app_settings`) with UI configuration modal |
| 5 | Submission format | Clean GitHub repository on `main` branch with complete setup guide, API docs, and system design |
| 6 | Hosting platform | Turnkey Dockerfile, Docker Compose, Render Blueprint (`render.yaml`), and Vercel configs |

---

## Phase 1 — Project Setup
- [x] Finalize tech stack and record in knowledge graph
- [x] Add `.gitignore` covering `node_modules/`, `.env`, `dist/`, `.vscode/`, `.idea/`, upload temp folders, `__pycache__`, and `notes.txt`
- [x] Scaffold backend, frontend, docs, and shared configuration
- [x] Set up DB connection using environment variables & SQLAlchemy (SQLite / PostgreSQL)

## Phase 2 — Data Model & Schema
- [x] Design `User` table with `role` field (`resident` / `admin`), `unit_no`, and `phone`
- [x] Design `Complaint` table: title, category, description, photo_url, status, priority, resident_id, unit_no, created_at, resolved_at
- [x] Design `ComplaintStatusHistory` table: complaint_id, old_status, new_status, actor_id, actor_name, note, timestamp
- [x] Design `Notice` table: title, body, is_important (pinned flag), posted_by, created_at
- [x] Design `AppSetting` table for overdue threshold configuration
- [x] Write ER diagram / database schema document (`docs/database_schema.md`)

## Phase 3 — Auth & Role-Based Access
- [x] Resident registration + login
- [x] Admin login (pre-seeded admin demo + admin role registration)
- [x] Role-based route protection (`get_current_user`, `get_current_admin`, React `ProtectedRoute`)
- [x] Password hashing with bcrypt + JWT authentication tokens

## Phase 4 — Complaint Lifecycle (Backend)
- [x] Resident: create complaint (title, category, description, optional photo)
- [x] Resident: list own complaints with full status history
- [x] Admin: list all complaints, filter by category / status / date range / search query
- [x] Admin: set/update priority (Low, Medium, High)
- [x] Admin: update status (Open ➔ In Progress ➔ Resolved), with timestamp, actor attribution, and optional note
- [x] Auto-close complaint once marked Resolved (lock against further edits)
- [x] Overdue detection engine: dynamically flag complaints open beyond threshold
- [x] Sort/surface overdue complaints at the top of admin complaint view

## Phase 5 — Photo Upload
- [x] Implement upload endpoint (`POST /api/complaints/upload-photo`)
- [x] Validate file type (JPEG, PNG, WEBP) and enforce max 5MB size limit
- [x] Attach photo reference to complaint record
- [x] Display photo thumbnail with lightbox full-view in resident and admin complaint views

## Phase 6 — Notice Board
- [x] Admin: create notice with title and body
- [x] Admin: mark notice as important ➔ pin to top of board
- [x] Admin: delete notice
- [x] Resident: view notice board (pinned notices first, then chronological)

## Phase 7 — Email Notifications
- [x] Integrate email service supporting SMTP + async background tasks
- [x] Trigger email to resident on complaint status change
- [x] Trigger email blast to residents on new important notice
- [x] Handle email failures gracefully (non-blocking background workers)

## Phase 8 — Admin Dashboard
- [x] Metric cards: Total complaints, Open, In Progress, Resolved, Overdue count
- [x] Category distribution breakdown
- [x] Recent status activity timeline
- [x] Quick access to overdue threshold configuration & notice creator

## Phase 9 — Frontend (Resident + Admin)
- [x] Resident: Register & Login pages with one-click demo login buttons
- [x] Resident: Raise complaint form with category selector & photo uploader
- [x] Resident: Complaint list with status badges, priority badges, and audit history timeline
- [x] Resident: Society notice board widget
- [x] Admin: Full management hub with filters, search, priority selector, status updater
- [x] Admin: Overdue complaints highlighted & surfaced to top
- [x] Admin: Notice creation modal with pin toggle
- [x] Admin: System configuration modal for overdue threshold days

## Phase 10 — Testing & Verification
- [x] Automated backend tests with Pytest (`backend/tests/test_api.py`) passing 100%
- [x] Frontend production build verification with `npm run build` passing with zero errors
- [x] End-to-end complaint lifecycle verified

## Phase 11 — Documentation
- [x] `README.md`: Setup guide, run instructions, tech stack, features, demo accounts
- [x] `backend/.env.example` listing all configuration variables
- [x] `docs/api_docs.md`: Comprehensive API reference
- [x] `docs/database_schema.md`: Database ER diagram and table schemas
- [x] `docs/system_design.md`: System design write-up (**max 800 words**) covering complaint history model, overdue detection, photo handling, and notification flow

## Phase 12 — Deployment & Compliance
- [x] Multi-stage `Dockerfile` and `docker-compose.yml` for containerized hosting
- [x] `render.yaml` for Render 1-click cloud deployment
- [x] `frontend/vercel.json` for Vercel SPA routing
- [x] FastAPI integrated static SPA server for single-service deployments
- [x] App runs error-free
- [x] Code structured cleanly across `backend/` and `frontend/`
- [x] No `node_modules`, `.env`, temporary files, or SQLite test binaries committed
- [x] Minimal and native dependencies
- [x] Branch is `main`
