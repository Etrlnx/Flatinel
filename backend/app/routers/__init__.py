from backend.app.routers.auth import router as auth_router
from backend.app.routers.complaints import router as complaints_router
from backend.app.routers.notices import router as notices_router
from backend.app.routers.dashboard import router as dashboard_router
from backend.app.routers.settings import router as settings_router

__all__ = [
    "auth_router",
    "complaints_router",
    "notices_router",
    "dashboard_router",
    "settings_router",
]
