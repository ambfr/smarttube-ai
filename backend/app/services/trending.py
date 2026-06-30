import httpx
from app.config import settings
from app.models.video import VideoResult

YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

# YouTube's official video category IDs (region: US, but works broadly)
CATEGORY_MAP = {
    "tech": "28",        # Science & Technology
    "education": "27",   # Education
    "gaming": "20",       # Gaming
    "music": "10",        # Music
    "entertainment": "24",  # Entertainment
}


async def fetch_trending(category: str = "tech", region: str = "US", max_results: int = 12) -> list[VideoResult]:
    """Fetch YouTube's trending videos, optionally filtered by category."""
    category_id = CATEGORY_MAP.get(category.lower())

    params = {
        "part": "snippet,statistics,contentDetails",
        "chart": "mostPopular",
        "regionCode": region,
        "maxResults": max_results,
        "key": settings.youtube_api_key,
    }
    if category_id:
        params["videoCategoryId"] = category_id

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(YOUTUBE_VIDEOS_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for video in data.get("items", []):
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})
            content = video.get("contentDetails", {})

            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = (
                thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
            )

            results.append(VideoResult(
                video_id=video["id"],
                title=snippet.get("title", ""),
                channel=snippet.get("channelTitle", ""),
                views=int(stats.get("viewCount", 0)) if stats.get("viewCount") else None,
                likes=int(stats.get("likeCount", 0)) if stats.get("likeCount") else None,
                published_at=snippet.get("publishedAt"),
                duration=content.get("duration"),
                thumbnail_url=thumbnail_url,
            ))

        return results
