import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.utils.seed import seed_data
from backend.app.routers import (
    auth_router,
    complaints_router,
    notices_router,
    dashboard_router,
    settings_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack apartment maintenance tracker API with complaint lifecycle, overdue detection, notice board, and notification flow.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.cors_origins_list else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(notices_router)
app.include_router(dashboard_router)
app.include_router(settings_router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
frontend_assets = os.path.join(frontend_dist, "assets")

if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="static-assets")

if os.path.exists(frontend_dist):
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        real_file_path = os.path.realpath(file_path)
        real_dist = os.path.realpath(frontend_dist)
        if real_file_path.startswith(real_dist) and os.path.exists(real_file_path) and os.path.isfile(real_file_path):
            return FileResponse(real_file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs_url": "/docs",
            "status": "online"
        }
