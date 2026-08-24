# Society Maintenance Tracker — API Documentation

Base URL: `http://localhost:8000/api`  
Interactive Swagger Docs: `http://localhost:8000/docs`  
Alternative ReDoc: `http://localhost:8000/redoc`

---

## Authentication Endpoints

### 1. Register User
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Resident",
  "email": "jane@example.com",
  "password": "securepassword123",
  "unit_no": "Flat 304, Block A",
  "phone": "+1-555-0199",
  "role": "resident" // or "admin"
}
```
- **Response** `(201 Created)`:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 4,
    "name": "Jane Resident",
    "email": "jane@example.com",
    "role": "resident",
    "unit_no": "Flat 304, Block A",
    "phone": "+1-555-0199",
    "created_at": "2026-08-25T00:00:00"
  }
}
```

### 2. Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@society.com",
  "password": "admin123"
}
```
- **Response** `(200 OK)`: Returns Token & User payload.

### 3. Get Current Profile
- **Endpoint**: `GET /auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response** `(200 OK)`: User Profile object.

---

## Complaints Endpoints

### 1. Create Complaint
- **Endpoint**: `POST /complaints`
- **Access**: Authenticated (Resident / Admin)
- **Request Body**:
```json
{
  "title": "Kitchen sink pipe leakage",
  "category": "Plumbing",
  "description": "Continuous drip under the cabinet.",
  "unit_no": "Flat 402, Block A",
  "photo_url": "/uploads/a8b9c1d2...jpg"
}
```
- **Response** `(201 Created)`: Created `ComplaintResponse` object with initial `history` record.

### 2. Upload Supporting Photo
- **Endpoint**: `POST /complaints/upload-photo`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (image file, max 5MB)
- **Response** `(201 Created)`:
```json
{
  "photo_url": "/uploads/8e9d3b4...png"
}
```

### 3. List Complaints
- **Endpoint**: `GET /complaints`
- **Access**: Authenticated
  - *Residents*: Automatically filtered to own complaints.
  - *Admins*: Returns all complaints sorted with Overdue items first.
- **Query Parameters (Admin)**:
  - `category` (string, optional) e.g. `Plumbing`, `Electrical`, `Carpentry`
  - `status` (string, optional) e.g. `Open`, `In Progress`, `Resolved`
  - `start_date` (ISO date, optional) e.g. `2026-08-01`
  - `end_date` (ISO date, optional) e.g. `2026-08-25`
- **Response** `(200 OK)`: Array of `ComplaintResponse` objects with nested `history` and `is_overdue` calculation.

### 4. Get Complaint Details
- **Endpoint**: `GET /complaints/{complaint_id}`
- **Access**: Owner or Admin
- **Response** `(200 OK)`: `ComplaintResponse` object with full status audit history.

### 5. Update Complaint Status (Admin)
- **Endpoint**: `PATCH /complaints/{complaint_id}/status`
- **Access**: Admin only
- **Request Body**:
```json
{
  "status": "In Progress", // "Open" | "In Progress" | "Resolved"
  "note": "Technician dispatched for site inspection."
}
```
- **Response** `(200 OK)`: Updated `ComplaintResponse`. Triggers asynchronous email to resident.

### 6. Update Complaint Priority (Admin)
- **Endpoint**: `PATCH /complaints/{complaint_id}/priority`
- **Access**: Admin only
- **Request Body**:
```json
{
  "priority": "High" // "Low" | "Medium" | "High"
}
```

---

## Notice Board Endpoints

### 1. List Notices
- **Endpoint**: `GET /notices`
- **Access**: Authenticated (Resident & Admin)
- **Response** `(200 OK)`: Array of notices, ordered with pinned/important notices first.

### 2. Create Notice (Admin)
- **Endpoint**: `POST /notices`
- **Access**: Admin only
- **Request Body**:
```json
{
  "title": "Scheduled Power Maintenance",
  "body": "Backup generator testing will occur on Thursday from 2 PM to 4 PM.",
  "is_important": true
}
```
- **Response** `(201 Created)`: Created Notice object. If `is_important=true`, triggers resident email notification.

### 3. Update Notice (Admin)
- **Endpoint**: `PUT /notices/{notice_id}`
- **Access**: Admin only
- **Request Body**: `NoticeUpdate` (title, body, is_important)

### 4. Delete Notice (Admin)
- **Endpoint**: `DELETE /notices/{notice_id}`
- **Access**: Admin only
- **Response** `(204 No Content)`

---

## Dashboard & System Settings Endpoints

### 1. Dashboard Statistics
- **Endpoint**: `GET /dashboard/stats`
- **Access**: Admin only
- **Response** `(200 OK)`:
```json
{
  "total_complaints": 12,
  "open_complaints": 4,
  "in_progress_complaints": 3,
  "resolved_complaints": 5,
  "overdue_complaints": 2,
  "by_category": {
    "Plumbing": 5,
    "Electrical": 3,
    "Carpentry": 2,
    "Appliance": 1,
    "Common Area": 1,
    "Security": 0,
    "Other": 0
  },
  "by_priority": {
    "Low": 2,
    "Medium": 6,
    "High": 4
  },
  "recent_activity": [...],
  "total_residents": 8,
  "total_notices": 3
}
```

### 2. Get Overdue Threshold
- **Endpoint**: `GET /settings/overdue-threshold`
- **Access**: Admin only
- **Response** `(200 OK)`: `{"days": 3}`

### 3. Update Overdue Threshold
- **Endpoint**: `PUT /settings/overdue-threshold`
- **Access**: Admin only
- **Request Body**: `{"days": 5}`
- **Response** `(200 OK)`: `{"message": "Overdue threshold updated to 5 days", "days": 5}`
