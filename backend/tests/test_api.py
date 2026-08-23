import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models.user import User, UserRole
from backend.app.services.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_society.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    admin = User(
        name="Test Admin",
        email="testadmin@society.com",
        password_hash=get_password_hash("adminpass123"),
        role=UserRole.ADMIN,
        unit_no="Admin Suite"
    )
    resident = User(
        name="Test Resident",
        email="testresident@society.com",
        password_hash=get_password_hash("residentpass123"),
        role=UserRole.RESIDENT,
        unit_no="Flat 101"
    )
    db.add_all([admin, resident])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_society.db"):
        try:
            os.remove("./test_society.db")
        except Exception:
            pass


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}


def test_auth_login_and_token(client):
    res = client.post("/api/auth/login", json={
        "email": "testresident@society.com",
        "password": "residentpass123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "resident"

    res_admin = client.post("/api/auth/login", json={
        "email": "testadmin@society.com",
        "password": "adminpass123"
    })
    assert res_admin.status_code == 200
    assert res_admin.json()["user"]["role"] == "admin"


def test_complaint_lifecycle_and_history(client):
    res = client.post("/api/auth/login", json={
        "email": "testresident@society.com",
        "password": "residentpass123"
    })
    res_token = res.json()["access_token"]
    res_headers = {"Authorization": f"Bearer {res_token}"}

    complaint_payload = {
        "title": "Water leakage in bathroom",
        "category": "Plumbing",
        "description": "Pipe leaking below the main washbasin.",
        "unit_no": "Flat 101"
    }
    c_res = client.post("/api/complaints", json=complaint_payload, headers=res_headers)
    assert c_res.status_code == 201
    c_data = c_res.json()
    complaint_id = c_data["id"]
    assert c_data["status"] == "Open"
    assert len(c_data["history"]) >= 1
    assert c_data["history"][0]["new_status"] == "Open"

    admin_login = client.post("/api/auth/login", json={
        "email": "testadmin@society.com",
        "password": "adminpass123"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    p_res = client.patch(f"/api/complaints/{complaint_id}/priority", json={"priority": "High"}, headers=admin_headers)
    assert p_res.status_code == 200
    assert p_res.json()["priority"] == "High"

    s_res = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "In Progress",
        "note": "Technician dispatched."
    }, headers=admin_headers)
    assert s_res.status_code == 200
    assert s_res.json()["status"] == "In Progress"
    assert len(s_res.json()["history"]) == 2
    assert s_res.json()["history"][0]["note"] == "Technician dispatched."

    r_res = client.patch(f"/api/complaints/{complaint_id}/status", json={
        "status": "Resolved",
        "note": "Washer replaced, leak fixed."
    }, headers=admin_headers)
    assert r_res.status_code == 200
    assert r_res.json()["status"] == "Resolved"
    assert r_res.json()["resolved_at"] is not None


def test_notice_board(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "testadmin@society.com",
        "password": "adminpass123"
    })
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    n_res = client.post("/api/notices", json={
        "title": "Fire Drill on Saturday",
        "body": "Annual fire safety drill at 11 AM.",
        "is_important": True
    }, headers=admin_headers)
    assert n_res.status_code == 201
    assert n_res.json()["is_important"] is True

    res_login = client.post("/api/auth/login", json={
        "email": "testresident@society.com",
        "password": "residentpass123"
    })
    res_headers = {"Authorization": f"Bearer {res_login.json()['access_token']}"}

    list_res = client.get("/api/notices", headers=res_headers)
    assert list_res.status_code == 200
    notices = list_res.json()
    assert len(notices) >= 1
    assert notices[0]["is_important"] is True


def test_dashboard_and_settings(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "testadmin@society.com",
        "password": "adminpass123"
    })
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    d_res = client.get("/api/dashboard/stats", headers=admin_headers)
    assert d_res.status_code == 200
    stats = d_res.json()
    assert "total_complaints" in stats
    assert "by_category" in stats
    assert "overdue_complaints" in stats

    set_res = client.put("/api/settings/overdue-threshold", json={"days": 5}, headers=admin_headers)
    assert set_res.status_code == 200
    assert set_res.json()["days"] == 5
