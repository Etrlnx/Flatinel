from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.models.notice import Notice
from backend.app.schemas.notice import (
    NoticeCreate,
    NoticeUpdate,
    NoticeResponse,
)
from backend.app.services.auth import get_current_user, get_current_admin
from backend.app.services.email import send_important_notice_notification

router = APIRouter(prefix="/api/notices", tags=["Notice Board"])


@router.get("", response_model=List[NoticeResponse])
def get_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notices = db.query(Notice).order_by(
        desc(Notice.is_important),
        desc(Notice.created_at)
    ).all()
    return notices


@router.post("", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
def create_notice(
    notice_in: NoticeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    notice = Notice(
        title=notice_in.title.strip(),
        body=notice_in.body.strip(),
        is_important=notice_in.is_important,
        posted_by=admin_user.id
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    if notice.is_important:
        residents = db.query(User).filter(User.role == UserRole.RESIDENT).all()
        resident_emails = [r.email for r in residents if r.email]
        if resident_emails:
            background_tasks.add_task(
                send_important_notice_notification,
                recipient_emails=resident_emails,
                notice_title=notice.title,
                notice_body=notice.body,
                admin_name=admin_user.name
            )

    return notice


@router.put("/{notice_id}", response_model=NoticeResponse)
def update_notice(
    notice_id: int,
    notice_in: NoticeUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")

    if notice_in.title is not None:
        notice.title = notice_in.title.strip()
    if notice_in.body is not None:
        notice.body = notice_in.body.strip()
    if notice_in.is_important is not None:
        notice.is_important = notice_in.is_important

    db.commit()
    db.refresh(notice)
    return notice


@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")

    db.delete(notice)
    db.commit()
    return None
