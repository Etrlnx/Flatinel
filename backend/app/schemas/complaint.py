from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from backend.app.models.complaint import (
    ComplaintStatus,
    ComplaintPriority,
    ComplaintCategory,
)
from backend.app.schemas.user import UserResponse


class StatusHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    old_status: Optional[str] = None
    new_status: str
    actor_id: Optional[int] = None
    actor_name: str
    note: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(BaseModel):
    title: str
    category: str = ComplaintCategory.OTHER.value
    description: str
    unit_no: Optional[str] = None
    photo_url: Optional[str] = None


class ComplaintUpdateStatus(BaseModel):
    status: ComplaintStatus
    note: Optional[str] = None


class ComplaintUpdatePriority(BaseModel):
    priority: ComplaintPriority


class ComplaintResponse(BaseModel):
    id: int
    title: str
    category: str
    description: str
    photo_url: Optional[str] = None
    status: ComplaintStatus
    priority: ComplaintPriority
    resident_id: int
    unit_no: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    is_overdue: bool = False
    days_open: int = 0
    resident: Optional[UserResponse] = None
    history: List[StatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)
