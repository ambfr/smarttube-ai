from pydantic import BaseModel
from typing import Optional

class VideoResult(BaseModel):
    video_id: str
    title: str
    channel: str
    views: Optional[int] = None
    likes: Optional[int] = None
    published_at: Optional[str] = None
    duration: Optional[str] = None
    thumbnail_url: Optional[str] = None

class RankedVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    views: Optional[int] = None
    likes: Optional[int] = None
    published_at: Optional[str] = None
    duration: Optional[str] = None
    thumbnail_url: Optional[str] = None
    score: float
    label: Optional[str] = None
    rank: int
    ai_summary: Optional[str] = None
    ai_tag: Optional[str] = None
    positive_signals: list[str] = []
    negative_signals: list[str] = []
    sentiment_score: Optional[float] = None
    comments_read: int = 0
    video_summary: Optional[str] = None
    is_short: bool = False

class SearchResponse(BaseModel):
    query: str
    results: list[VideoResult]
    total: int

class RankResponse(BaseModel):
    query: str
    intent: str
    results: list[RankedVideo]
    total: int
    top_score: float
    total_comments_read: int
    shorts: list[RankedVideo] = []
