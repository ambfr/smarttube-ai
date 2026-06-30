from fastapi import APIRouter, HTTPException, Query
from app.services.youtube import search_youtube
from app.services.scoring import (
    compute_score_with_sentiment,
    apply_content_analysis_adjustment,
    is_short_video,
)
from app.services.groq import get_ai_summary, get_video_summary
from app.services.comments import fetch_comments
from app.services.sentiment import analyze_sentiment
from app.services.transcript import fetch_transcript
from app.services.content_analysis import analyze_transcript
from app.models.video import RankResponse, RankedVideo

router = APIRouter()

@router.get("/rank", response_model=RankResponse)
async def rank(
    query: str = Query(..., min_length=1),
    intent: str = Query("beginner"),
    max_results: int = Query(8, ge=1, le=15),
):
    try:
        # 1. Fetch raw YouTube results
        videos = await search_youtube(query, max_results)
        if not videos:
            return RankResponse(query=query, intent=intent, results=[], total=0, top_score=0, total_comments_read=0)

        # 1b. Split out Shorts — they get a separate lightweight track, not full ranking
        shorts = [v for v in videos if is_short_video(v.duration)]
        videos = [v for v in videos if not is_short_video(v.duration)]

        # 2. For top 6 videos, fetch comments + sentiment
        sentiment_data = {}
        total_comments_read = 0

        for video in videos[:6]:
            comments = await fetch_comments(video.video_id, max_results=40)
            total_comments_read += len(comments)
            sentiment = await analyze_sentiment(comments) if comments else {
                "positive": [], "negative": [], "sentiment_score": 50.0
            }
            sentiment_data[video.video_id] = {
                "sentiment": sentiment,
                "comments_count": len(comments),
            }

        # 3. Compute base scores (metadata + sentiment)
        scored = []
        for video in videos:
            s = sentiment_data.get(video.video_id, {})
            sentiment_score = s.get("sentiment", {}).get("sentiment_score", 50.0)
            base_score = compute_score_with_sentiment(video, intent, sentiment_score)
            scored.append((video, base_score, s))

        scored.sort(key=lambda x: x[1], reverse=True)

        # 4. Fetch transcripts for ALL videos (used for both content analysis + summaries)
        transcripts = {}
        for video, base_score, s in scored:
            transcripts[video.video_id] = fetch_transcript(video.video_id)

        # 5. Content analysis (top 5 only — expensive, only matters for ranking)
        content_data = {}
        for video, base_score, s in scored[:5]:
            transcript = transcripts.get(video.video_id, "")
            if transcript:
                content_data[video.video_id] = await analyze_transcript(video.title, transcript)
            else:
                content_data[video.video_id] = None

        # 6. Re-score with content analysis adjustment applied
        final_scored = []
        for video, base_score, s in scored:
            content_analysis = content_data.get(video.video_id)
            if content_analysis:
                final_score = apply_content_analysis_adjustment(base_score, content_analysis)
            else:
                final_score = base_score
            final_scored.append((video, final_score, s, content_analysis))

        final_scored.sort(key=lambda x: x[1], reverse=True)

        # 7. Build response — AI tag for top 4, video_summary for ALL videos
        LABELS = ["Best overall", "Quick learning", "Best for beginners", "Most detailed"]
        results = []

        for i, (video, score, s, content_analysis) in enumerate(final_scored):
            label = LABELS[i] if i < len(LABELS) else None
            sentiment = s.get("sentiment", {})

            ai_summary = ""
            ai_tag = ""
            if i < 4:
                ai_data = await get_ai_summary(
                    title=video.title,
                    channel=video.channel,
                    views=video.views or 0,
                    score=score,
                )
                ai_summary = ai_data.get("summary", "")
                ai_tag = ai_data.get("tag", "")

            # Video summary for every result
            transcript = transcripts.get(video.video_id, "")
            video_summary = await get_video_summary(video.title, video.channel, transcript)

            results.append(RankedVideo(
                video_id=video.video_id,
                title=video.title,
                channel=video.channel,
                views=video.views,
                likes=video.likes,
                published_at=video.published_at,
                duration=video.duration,
                thumbnail_url=video.thumbnail_url,
                score=score,
                label=label,
                rank=i,
                ai_summary=ai_summary,
                ai_tag=ai_tag,
                positive_signals=sentiment.get("positive", []),
                negative_signals=sentiment.get("negative", []),
                sentiment_score=sentiment.get("sentiment_score"),
                comments_read=s.get("comments_count", 0),
                video_summary=video_summary,
            ))

        top_score = results[0].score if results else 0

        # Build lightweight shorts list — just metadata, no AI scoring (keeps speed fast)
        shorts_results = [
            RankedVideo(
                video_id=v.video_id,
                title=v.title,
                channel=v.channel,
                views=v.views,
                likes=v.likes,
                published_at=v.published_at,
                duration=v.duration,
                thumbnail_url=v.thumbnail_url,
                score=0,
                label=None,
                rank=i,
                is_short=True,
            )
            for i, v in enumerate(shorts)
        ]

        return RankResponse(
            query=query,
            intent=intent,
            results=results,
            total=len(results),
            top_score=top_score,
            total_comments_read=total_comments_read,
            shorts=shorts_results,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
