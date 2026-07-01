from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.search import router as search_router
from app.routes.rank import router as rank_router
from app.routes.auth import router as auth_router
from app.routes.saved import router as saved_router
from app.database import connect_db, close_db

app = FastAPI(title="SmartTube AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",  "https://*.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(search_router)
app.include_router(rank_router)
app.include_router(auth_router)
app.include_router(saved_router)

@app.get("/")
async def root():
    return {"status": "SmartTube AI backend running"}