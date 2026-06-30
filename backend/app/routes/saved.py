from fastapi import APIRouter, HTTPException, Depends
from app.models.saved import SaveVideoRequest, SavedVideosResponse, SavedVideo
from app.database import get_db
from app.dependencies import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/saved", tags=["saved"])


@router.post("")
async def save_video(data: SaveVideoRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    existing = await db["saved_videos"].find_one({
        "user_id": user_id,
        "video_id": data.video_id,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Video already saved")

    doc = data.model_dump()
    doc["user_id"] = user_id
    doc["saved_at"] = datetime.now(timezone.utc).isoformat()

    await db["saved_videos"].insert_one(doc)
    return {"status": "saved"}


@router.delete("/{video_id}")
async def unsave_video(video_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    result = await db["saved_videos"].delete_one({
        "user_id": user_id,
        "video_id": video_id,
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved video not found")

    return {"status": "removed"}


@router.get("", response_model=SavedVideosResponse)
async def get_saved_videos(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    cursor = db["saved_videos"].find({"user_id": user_id}).sort("saved_at", -1)
    docs = await cursor.to_list(length=200)

    saved = [
        SavedVideo(
            video_id=d["video_id"],
            title=d["title"],
            channel=d["channel"],
            views=d.get("views"),
            duration=d.get("duration"),
            thumbnail_url=d.get("thumbnail_url"),
            score=d.get("score"),
            label=d.get("label"),
            saved_at=d["saved_at"],
        )
        for d in docs
    ]

    return SavedVideosResponse(saved=saved, total=len(saved))


@router.get("/check/{video_id}")
async def check_saved(video_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    existing = await db["saved_videos"].find_one({
        "user_id": user_id,
        "video_id": video_id,
    })
    return {"saved": existing is not None}
