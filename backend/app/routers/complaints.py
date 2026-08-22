from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.models.complaint import (
    Complaint,
    ComplaintStatus,
    ComplaintPriority,
    ComplaintStatusHistory,
)
from backend.app.models.setting import AppSetting
from backend.app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdateStatus,
    ComplaintUpdatePriority,
    ComplaintResponse,
    StatusHistoryResponse,
)
from backend.app.services.auth import get_current_user, get_current_admin
from backend.app.services.email import send_status_update_notification
from backend.app.utils.file_upload import save_upload_photo

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


def get_overdue_threshold_days(db: Session) -> int:
    setting = db.query(AppSetting).filter(AppSetting.key == "overdue_threshold_days").first()
    if setting:
        try:
            return int(setting.value)
        except ValueError:
            pass
    return settings.DEFAULT_OVERDUE_DAYS


def enrich_complaint_response(complaint: Complaint, threshold_days: int) -> ComplaintResponse:
    now = datetime.utcnow()
    days_open = (now - complaint.created_at).days
    is_overdue = (complaint.status != ComplaintStatus.RESOLVED) and (days_open >= threshold_days)
    
    histories = [
        StatusHistoryResponse.model_validate(h)
        for h in sorted(complaint.history, key=lambda x: x.timestamp, reverse=True)
    ]

    res = ComplaintResponse(
        id=complaint.id,
        title=complaint.title,
        category=complaint.category,
        description=complaint.description,
        photo_url=complaint.photo_url,
        status=complaint.status,
        priority=complaint.priority,
        resident_id=complaint.resident_id,
        unit_no=complaint.unit_no,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
        is_overdue=is_overdue,
        days_open=days_open,
        resident=complaint.resident,
        history=histories
    )
    return res


@router.post("/upload-photo", status_code=status.HTTP_201_CREATED)
def upload_complaint_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    photo_url = save_upload_photo(file)
    return {"photo_url": photo_url}


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unit = complaint_in.unit_no or current_user.unit_no or "Unspecified"
    
    complaint = Complaint(
        title=complaint_in.title.strip(),
        category=complaint_in.category,
        description=complaint_in.description.strip(),
        photo_url=complaint_in.photo_url,
        status=ComplaintStatus.OPEN,
        priority=ComplaintPriority.MEDIUM,
        resident_id=current_user.id,
        unit_no=unit
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    initial_history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status=ComplaintStatus.OPEN.value,
        actor_id=current_user.id,
        actor_name=current_user.name,
        note="Complaint created"
    )
    db.add(initial_history)
    db.commit()
    db.refresh(complaint)

    threshold_days = get_overdue_threshold_days(db)
    return enrich_complaint_response(complaint, threshold_days)


@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    threshold_days = get_overdue_threshold_days(db)
    query = db.query(Complaint)

    if current_user.role != UserRole.ADMIN:
        query = query.filter(Complaint.resident_id == current_user.id)
    else:
        if category and category != "All":
            query = query.filter(Complaint.category == category)
        if status_filter and status_filter != "All":
            query = query.filter(Complaint.status == status_filter)
        if start_date:
            try:
                s_dt = datetime.fromisoformat(start_date)
                query = query.filter(Complaint.created_at >= s_dt)
            except ValueError:
                pass
        if end_date:
            try:
                e_dt = datetime.fromisoformat(end_date) + timedelta(days=1)
                query = query.filter(Complaint.created_at < e_dt)
            except ValueError:
                pass

    complaints = query.order_by(desc(Complaint.created_at)).all()
    enriched = [enrich_complaint_response(c, threshold_days) for c in complaints]

    if current_user.role == UserRole.ADMIN:
        enriched.sort(key=lambda x: (not x.is_overdue, x.status == ComplaintStatus.RESOLVED, -x.created_at.timestamp()))

    return enriched


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_by_id(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if current_user.role != UserRole.ADMIN and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    threshold_days = get_overdue_threshold_days(db)
    return enrich_complaint_response(complaint, threshold_days)


@router.patch("/{complaint_id}/priority", response_model=ComplaintResponse)
def update_complaint_priority(
    complaint_id: int,
    priority_in: ComplaintUpdatePriority,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.priority = priority_in.priority
    db.commit()
    db.refresh(complaint)

    threshold_days = get_overdue_threshold_days(db)
    return enrich_complaint_response(complaint, threshold_days)


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_in: ComplaintUpdateStatus,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if complaint.status == ComplaintStatus.RESOLVED and status_in.status == ComplaintStatus.RESOLVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint is already resolved and closed."
        )

    old_status = complaint.status.value
    new_status = status_in.status.value

    complaint.status = status_in.status
    if status_in.status == ComplaintStatus.RESOLVED:
        complaint.resolved_at = datetime.utcnow()

    history_entry = ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        actor_id=admin_user.id,
        actor_name=admin_user.name,
        note=status_in.note.strip() if status_in.note else None,
        timestamp=datetime.utcnow()
    )
    db.add(history_entry)
    db.commit()
    db.refresh(complaint)

    resident = complaint.resident
    if resident and resident.email:
        background_tasks.add_task(
            send_status_update_notification,
            resident_email=resident.email,
            resident_name=resident.name,
            complaint_title=complaint.title,
            complaint_id=complaint.id,
            old_status=old_status,
            new_status=new_status,
            actor_name=admin_user.name,
            note=status_in.note
        )

    threshold_days = get_overdue_threshold_days(db)
    return enrich_complaint_response(complaint, threshold_days)
