from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None


class SettingResponse(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OverdueThresholdUpdate(BaseModel):
    days: int
