from pydantic import BaseModel
from typing import Optional


class SaveVideoRequest(BaseModel):
    video_id: str
    title: str
    channel: str
    views: Optional[int] = None
    duration: Optional[str] = None
    thumbnail_url: Optional[str] = None
    score: Optional[float] = None
    label: Optional[str] = None


class SavedVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    views: Optional[int] = None
    duration: Optional[str] = None
    thumbnail_url: Optional[str] = None
    score: Optional[float] = None
    label: Optional[str] = None
    saved_at: str


class SavedVideosResponse(BaseModel):
    saved: list[SavedVideo]
    total: int
