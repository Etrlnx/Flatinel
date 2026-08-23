from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.setting import AppSetting
from backend.app.schemas.setting import (
    SettingResponse,
    OverdueThresholdUpdate,
)
from backend.app.services.auth import get_current_admin
from backend.app.config import settings

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=List[SettingResponse])
def get_all_settings(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    return db.query(AppSetting).all()


@router.get("/overdue-threshold")
def get_overdue_threshold(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    setting = db.query(AppSetting).filter(AppSetting.key == "overdue_threshold_days").first()
    days = int(setting.value) if setting else settings.DEFAULT_OVERDUE_DAYS
    return {"days": days}


@router.put("/overdue-threshold")
def update_overdue_threshold(
    threshold_in: OverdueThresholdUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    if threshold_in.days < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Overdue threshold must be at least 1 day."
        )

    setting = db.query(AppSetting).filter(AppSetting.key == "overdue_threshold_days").first()
    if not setting:
        setting = AppSetting(
            key="overdue_threshold_days",
            value=str(threshold_in.days),
            description="Number of days after which an open complaint is considered overdue"
        )
        db.add(setting)
    else:
        setting.value = str(threshold_in.days)

    db.commit()
    return {"message": f"Overdue threshold updated to {threshold_in.days} days", "days": threshold_in.days}
