from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.models.user import User, UserRole
from backend.app.models.complaint import (
    Complaint,
    ComplaintStatus,
    ComplaintPriority,
    ComplaintCategory,
    ComplaintStatusHistory,
)
from backend.app.models.notice import Notice
from backend.app.models.setting import AppSetting
from backend.app.services.auth import get_password_hash


def seed_data(db: Session):
    setting = db.query(AppSetting).filter(AppSetting.key == "overdue_threshold_days").first()
    if not setting:
        db.add(AppSetting(
            key="overdue_threshold_days",
            value="3",
            description="Number of days after which an open complaint is considered overdue"
        ))
        db.commit()

    admin_user = db.query(User).filter(User.email == "admin@society.com").first()
    if not admin_user:
        admin_user = User(
            name="Estate Admin",
            email="admin@society.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            unit_no="Admin Office",
            phone="+1-555-0100"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    resident_alice = db.query(User).filter(User.email == "alice@example.com").first()
    if not resident_alice:
        resident_alice = User(
            name="Alice Johnson",
            email="alice@example.com",
            password_hash=get_password_hash("resident123"),
            role=UserRole.RESIDENT,
            unit_no="Flat 402, Block A",
            phone="+1-555-0101"
        )
        db.add(resident_alice)

    resident_bob = db.query(User).filter(User.email == "bob@example.com").first()
    if not resident_bob:
        resident_bob = User(
            name="Bob Smith",
            email="bob@example.com",
            password_hash=get_password_hash("resident123"),
            role=UserRole.RESIDENT,
            unit_no="Flat 205, Block B",
            phone="+1-555-0102"
        )
        db.add(resident_bob)

    db.commit()
    if resident_alice:
        db.refresh(resident_alice)
    if resident_bob:
        db.refresh(resident_bob)

    if db.query(Notice).count() == 0:
        notice1 = Notice(
            title="⚠️ Scheduled Water Supply Maintenance & Tank Cleaning",
            body="Water supply will be suspended on Sunday from 10:00 AM to 4:00 PM for annual overhead tank cleaning and chlorination. Please store adequate water for personal use.",
            is_important=True,
            posted_by=admin_user.id,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        notice2 = Notice(
            title="Clubhouse & Gym Timings Update",
            body="Starting next Monday, the resident gym will open at 6:00 AM and close at 10:30 PM. Please wipe down all equipment after use.",
            is_important=False,
            posted_by=admin_user.id,
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add_all([notice1, notice2])
        db.commit()

    if db.query(Complaint).count() == 0 and resident_alice and resident_bob:
        c1 = Complaint(
            title="Kitchen Sink Drainage Clogged",
            category=ComplaintCategory.PLUMBING.value,
            description="The kitchen sink is draining very slowly and backing up into the second basin.",
            photo_url=None,
            status=ComplaintStatus.IN_PROGRESS,
            priority=ComplaintPriority.HIGH,
            resident_id=resident_alice.id,
            unit_no="Flat 402, Block A",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(c1)
        db.commit()
        db.refresh(c1)

        db.add_all([
            ComplaintStatusHistory(
                complaint_id=c1.id,
                old_status=None,
                new_status=ComplaintStatus.OPEN.value,
                actor_id=resident_alice.id,
                actor_name=resident_alice.name,
                note="Complaint raised by resident",
                timestamp=datetime.utcnow() - timedelta(days=2)
            ),
            ComplaintStatusHistory(
                complaint_id=c1.id,
                old_status=ComplaintStatus.OPEN.value,
                new_status=ComplaintStatus.IN_PROGRESS.value,
                actor_id=admin_user.id,
                actor_name=admin_user.name,
                note="Plumbing contractor assigned. Visiting tomorrow morning.",
                timestamp=datetime.utcnow() - timedelta(days=1)
            )
        ])

        c2 = Complaint(
            title="Corridor Light Flickering Constantly",
            category=ComplaintCategory.ELECTRICAL.value,
            description="The overhead fluorescent tube on 4th floor corridor keeps buzzing and flickering.",
            photo_url=None,
            status=ComplaintStatus.OPEN,
            priority=ComplaintPriority.MEDIUM,
            resident_id=resident_alice.id,
            unit_no="Flat 402, Block A",
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(c2)
        db.commit()
        db.refresh(c2)

        db.add(ComplaintStatusHistory(
            complaint_id=c2.id,
            old_status=None,
            new_status=ComplaintStatus.OPEN.value,
            actor_id=resident_alice.id,
            actor_name=resident_alice.name,
            note="Complaint raised by resident",
            timestamp=datetime.utcnow() - timedelta(days=5)
        ))

        c3 = Complaint(
            title="Balcony Sliding Door Latch Loose",
            category=ComplaintCategory.CARPENTRY.value,
            description="The sliding glass door latch is misaligned and won't lock securely.",
            photo_url=None,
            status=ComplaintStatus.RESOLVED,
            priority=ComplaintPriority.LOW,
            resident_id=resident_bob.id,
            unit_no="Flat 205, Block B",
            created_at=datetime.utcnow() - timedelta(days=4),
            resolved_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(c3)
        db.commit()
        db.refresh(c3)

        db.add_all([
            ComplaintStatusHistory(
                complaint_id=c3.id,
                old_status=None,
                new_status=ComplaintStatus.OPEN.value,
                actor_id=resident_bob.id,
                actor_name=resident_bob.name,
                note="Complaint raised by resident",
                timestamp=datetime.utcnow() - timedelta(days=4)
            ),
            ComplaintStatusHistory(
                complaint_id=c3.id,
                old_status=ComplaintStatus.OPEN.value,
                new_status=ComplaintStatus.IN_PROGRESS.value,
                actor_id=admin_user.id,
                actor_name=admin_user.name,
                note="Carpenter visited and ordered replacement latch screw.",
                timestamp=datetime.utcnow() - timedelta(days=2)
            ),
            ComplaintStatusHistory(
                complaint_id=c3.id,
                old_status=ComplaintStatus.IN_PROGRESS.value,
                new_status=ComplaintStatus.RESOLVED.value,
                actor_id=admin_user.id,
                actor_name=admin_user.name,
                note="Latch fixed and tested. Door locks smoothly.",
                timestamp=datetime.utcnow() - timedelta(days=1)
            )
        ])
        db.commit()
