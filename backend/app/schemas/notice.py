from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.user import UserResponse


class NoticeCreate(BaseModel):
    title: str
    body: str
    is_important: bool = False


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    is_important: Optional[bool] = None


class NoticeResponse(BaseModel):
    id: int
    title: str
    body: str
    is_important: bool
    posted_by: int
    created_at: datetime
    updated_at: datetime
    admin: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
