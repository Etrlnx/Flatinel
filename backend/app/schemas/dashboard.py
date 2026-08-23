from typing import Dict, List, Any
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_complaints: int
    open_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    overdue_complaints: int
    by_category: Dict[str, int]
    by_priority: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
    total_residents: int
    total_notices: int
