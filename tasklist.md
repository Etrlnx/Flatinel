# Society Maintenance Tracker — Master Task List

Source docs: `Society_Maintenance_Tracker.pdf` (problem statement) + `Assignment_Submission_Usage_Guidelines.pdf` (submission rules).
Every task below traces back to one of these two documents. Nothing outside them has been added.

---

## ⚠️ 0. Decisions You Need to Make First
These are things the problem statement leaves open. Pick an answer for each before coding — the choice affects folder structure, dependencies, and the knowledge graph.

| # | Open Point | Why it's ambiguous | Your options |
|---|---|---|---|
| 1 | Tech stack (backend, frontend, DB) | Not specified anywhere in either doc | e.g. Node/Express or Django/FastAPI + React/Next.js + PostgreSQL/MySQL/MongoDB |
| 2 | Photo storage | "Photo upload handling" is required, but no storage provider is named, and guidelines push for minimal/native dependencies | Local disk storage (`/uploads`, simplest, but lost on redeploy for Render/Railway free tier) vs. free-tier cloud storage (Cloudinary/Supabase Storage/S3 free tier) |
| 3 | Email provider | Problem statement says "any free tier service" | Nodemailer+Gmail SMTP, Resend, Brevo (Sendinblue), Mailgun sandbox, SendGrid free tier |
| 4 | Overdue threshold config | "Configurable number of days" — configurable by whom, stored where? | Env variable (simplest) vs. an admin-settings DB table editable from UI (more impressive for demo) |
| 5 | Zip vs GitHub link conflict | Problem statement deliverable #1 says "Zip file with complete source code"; Submission Guidelines say GitHub link is the **primary** required format | Interpret as: GitHub repo (main branch, public) **is** the submission, and the "zip" requirement is satisfied by GitHub's own "Download ZIP" button — confirm this reading is acceptable to whoever is grading, or attach a zip as a GitHub Release asset too |
| 6 | Hosting platform | Problem statement suggests Vercel/Render/Railway "or similar" | Pick one now so architecture (esp. photo storage + DB) matches its constraints (e.g. Render/Railway free DB vs. Vercel serverless + external DB) |

Once you answer these, update `knowledge_graph.json` → `open_decisions` (flip `"resolved": true` and fill `"chosen_option"`).

---

## Phase 1 — Project Setup
- [ ] Finalize tech stack (Decision #1) and record in knowledge graph
- [ ] Create GitHub repo, default/primary branch named `main`, visibility **public**
- [ ] Add `.gitignore` covering `node_modules/`, `.env`, `dist/`, `.next/`, `out/`, `.vscode/`, `.idea/`, upload temp folders
- [ ] Scaffold backend, frontend, and (if separate) shared/config folders
- [ ] Set up DB connection using environment variables only (no hardcoded secrets)

## Phase 2 — Data Model & Schema
- [ ] Design `User` table/collection with `role` field (`resident` / `admin`)
- [ ] Design `Complaint` table: category, description, photo URL/path, status, priority, resident_id, created_at
- [ ] Design `ComplaintStatusHistory` table: complaint_id, old_status, new_status, actor, note, timestamp
- [ ] Design `Notice` table: title, body, is_important (pinned flag), posted_by, created_at
- [ ] Design config storage for overdue threshold (per Decision #4)
- [ ] Write ER diagram / schema doc (needed later for README)

## Phase 3 — Auth & Role-Based Access
- [ ] Resident registration + login
- [ ] Admin login (seeded/admin-created — decide if self-registration for admin is allowed or pre-provisioned)
- [ ] Role-based route protection (resident vs. admin endpoints)
- [ ] Password hashing (bcrypt or equivalent) + JWT/session-based auth

## Phase 4 — Complaint Lifecycle (Backend)
- [ ] Resident: create complaint (category, description, optional photo)
- [ ] Resident: list own complaints with full status history
- [ ] Admin: list all complaints, filter by category / status / date
- [ ] Admin: set/update priority (Low, Medium, High)
- [ ] Admin: update status (Open → In Progress → Resolved), each change logged with timestamp + actor + optional note
- [ ] Auto-close complaint once marked Resolved (block further status edits)
- [ ] Overdue detection job/query: flag complaints open beyond configurable threshold
- [ ] Sort/surface overdue complaints at top of admin complaint view

## Phase 5 — Photo Upload
- [ ] Implement upload endpoint (per Decision #2 storage choice)
- [ ] Validate file type/size before accept
- [ ] Attach photo reference to complaint record
- [ ] Display photo in both resident and admin complaint views

## Phase 6 — Notice Board
- [ ] Admin: create notice
- [ ] Admin: mark notice as important → pin to top
- [ ] Resident: view notice board (pinned notices first, then chronological)

## Phase 7 — Email Notifications
- [ ] Integrate chosen free-tier email service (Decision #3)
- [ ] Trigger email to resident on complaint status change
- [ ] Trigger email to resident on new important notice
- [ ] Handle email failures gracefully (don't block the main action if email fails)

## Phase 8 — Admin Dashboard
- [ ] Total complaints by status (Open / In Progress / Resolved)
- [ ] Total complaints by category
- [ ] Count of overdue complaints
- [ ] Simple charts/cards on admin frontend

## Phase 9 — Frontend (Resident + Admin)
- [ ] Resident: register/login pages
- [ ] Resident: raise complaint form (category, description, photo upload)
- [ ] Resident: complaint list + status-history detail view
- [ ] Resident: notice board view
- [ ] Admin: complaint management table with filters + priority + status controls
- [ ] Admin: overdue complaints highlighted/pinned to top
- [ ] Admin: notice creation + pin toggle
- [ ] Admin: dashboard view

## Phase 10 — Testing & Cleanup
- [ ] Manually test full complaint lifecycle end-to-end (raise → prioritize → status changes → resolve)
- [ ] Test overdue flagging with a short threshold for demo purposes
- [ ] Test email delivery for both trigger types
- [ ] Remove all console logs, unused code, and test/dummy routes
- [ ] Run through Submission Guidelines checklist (Phase 12) before packaging

## Phase 11 — Documentation
- [ ] `README.md`: setup guide, run instructions, tech stack, features
- [ ] `.env.example` listing every required env var (no real secrets)
- [ ] API documentation (endpoints, methods, request/response shapes — Postman collection or Markdown table)
- [ ] Database schema doc (from Phase 2 ER diagram)
- [ ] System design write-up, **max 800 words**, covering exactly 4 things: complaint history model, overdue detection, photo handling, notification flow

## Phase 12 — Deployment
- [ ] Deploy backend + frontend to chosen host (Decision #6)
- [ ] Verify hosted DB connection and env vars are set in the hosting dashboard, not committed
- [ ] Smoke-test the live URL for all core flows

## Phase 13 — Submission Compliance Checklist (from Guidelines doc)
- [ ] App runs without errors
- [ ] Code files properly structured and named
- [ ] No `node_modules`, `.env`, build artifacts, or editor files committed
- [ ] Only strictly necessary dependencies used — no extra/unused packages
- [ ] Branch is `main`
- [ ] Repo is public and fully downloadable within GitHub limits (or Drive link <1GB, publicly accessible, if used as fallback)
- [ ] Comments/documentation present where necessary
- [ ] Final link shared per the exact instructions given for this assignment

---
*Update this file's checkboxes as you go — treat it as the single source of truth for progress, alongside `knowledge_graph.json` for facts/decisions.*
