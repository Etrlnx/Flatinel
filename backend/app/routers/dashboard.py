from datetime import datetime
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
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
from backend.app.schemas.dashboard import DashboardStatsResponse
from backend.app.services.auth import get_current_admin
from backend.app.config import settings

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_overdue_threshold_days(db: Session) -> int:
    setting = db.query(AppSetting).filter(AppSetting.key == "overdue_threshold_days").first()
    if setting:
        try:
            return int(setting.value)
        except ValueError:
            pass
    return settings.DEFAULT_OVERDUE_DAYS


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    threshold_days = get_overdue_threshold_days(db)
    complaints = db.query(Complaint).all()
    now = datetime.utcnow()

    total = len(complaints)
    open_count = sum(1 for c in complaints if c.status == ComplaintStatus.OPEN)
    in_prog_count = sum(1 for c in complaints if c.status == ComplaintStatus.IN_PROGRESS)
    resolved_count = sum(1 for c in complaints if c.status == ComplaintStatus.RESOLVED)

    overdue_count = sum(
        1 for c in complaints
        if c.status != ComplaintStatus.RESOLVED and (now - c.created_at).days >= threshold_days
    )

    categories = [cat.value for cat in ComplaintCategory]
    by_category = {cat: 0 for cat in categories}
    for c in complaints:
        cat_name = c.category if c.category in by_category else ComplaintCategory.OTHER.value
        by_category[cat_name] = by_category.get(cat_name, 0) + 1

    priorities = [p.value for p in ComplaintPriority]
    by_priority = {p: 0 for p in priorities}
    for c in complaints:
        if c.priority:
            p_val = c.priority.value if hasattr(c.priority, 'value') else c.priority
            by_priority[p_val] = by_priority.get(p_val, 0) + 1

    recent_history = db.query(ComplaintStatusHistory).order_by(
        desc(ComplaintStatusHistory.timestamp)
    ).limit(8).all()

    recent_activity = [
        {
            "id": h.id,
            "complaint_id": h.complaint_id,
            "complaint_title": h.complaint.title if h.complaint else "Complaint",
            "old_status": h.old_status,
            "new_status": h.new_status,
            "actor_name": h.actor_name,
            "note": h.note,
            "timestamp": h.timestamp.isoformat()
        }
        for h in recent_history
    ]

    total_residents = db.query(User).filter(User.role == UserRole.RESIDENT).count()
    total_notices = db.query(Notice).count()

    return DashboardStatsResponse(
        total_complaints=total,
        open_complaints=open_count,
        in_progress_complaints=in_prog_count,
        resolved_complaints=resolved_count,
        overdue_complaints=overdue_count,
        by_category=by_category,
        by_priority=by_priority,
        recent_activity=recent_activity,
        total_residents=total_residents,
        total_notices=total_notices
    )
