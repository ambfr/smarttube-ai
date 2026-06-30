from datetime import datetime, timezone
import math
import re
from app.models.video import VideoResult

# Intent weight maps — MUCH more aggressive differences per intent now
INTENT_WEIGHTS = {
    "beginner": {
        "engagement": 0.15,
        "freshness": 0.05,
        "channel_trust": 0.15,
        "duration_fit": 0.50,   # strongly prefer 10-25 min videos
        "view_popularity": 0.15,
    },
    "advanced": {
        "engagement": 0.15,
        "freshness": 0.45,      # strongly prefer recent uploads
        "channel_trust": 0.30,
        "duration_fit": 0.05,
        "view_popularity": 0.05,
    },
    "quick summary": {
        "engagement": 0.10,
        "freshness": 0.10,
        "channel_trust": 0.05,
        "duration_fit": 0.70,   # heavily punish anything over 10 min
        "view_popularity": 0.05,
    },
    "detailed": {
        "engagement": 0.10,
        "freshness": 0.05,
        "channel_trust": 0.10,
        "duration_fit": 0.65,   # heavily reward 30+ min videos
        "view_popularity": 0.10,
    },
    "review": {
        "engagement": 0.40,     # likes/views ratio is everything for reviews
        "freshness": 0.15,
        "channel_trust": 0.35,
        "duration_fit": 0.0,
        "view_popularity": 0.10,
    },
    "news": {
        "engagement": 0.05,
        "freshness": 0.75,      # almost entirely freshness-driven
        "channel_trust": 0.10,
        "duration_fit": 0.0,
        "view_popularity": 0.10,
    },
}

CATEGORY_LABELS = ["Best overall", "Quick learning", "Best for beginners", "Most detailed"]


def score_engagement(views: int, likes: int) -> float:
    if not views or not likes:
        return 30.0
    ratio = likes / views
    normalized = min(ratio / 0.05, 1.0)
    return round(normalized * 100, 2)


def score_freshness(published_at: str) -> float:
    if not published_at:
        return 30.0
    try:
        pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days_old = (now - pub_date).days
        # Steeper decay so freshness actually bites for News/Advanced
        score = 100 * math.exp(-0.006 * days_old)
        return round(max(score, 2.0), 2)
    except Exception:
        return 30.0


def score_channel_trust(views: int) -> float:
    if not views:
        return 20.0
    if views >= 10_000_000:
        return 95.0
    if views >= 1_000_000:
        return 80.0
    if views >= 100_000:
        return 60.0
    if views >= 10_000:
        return 40.0
    return 20.0


def score_duration_fit(iso_duration: str, intent: str) -> float:
    """Aggressive duration scoring — clear winners/losers per intent."""
    if not iso_duration:
        return 50.0
    try:
        match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_duration)
        if not match:
            return 50.0
        h = int(match.group(1) or 0)
        m = int(match.group(2) or 0)
        total_minutes = h * 60 + m

        if intent == "quick summary":
            if total_minutes <= 3:
                return 100.0
            if total_minutes <= 7:
                return 85.0
            if total_minutes <= 12:
                return 50.0
            if total_minutes <= 20:
                return 15.0
            return 2.0  # heavily punish long videos

        elif intent == "detailed":
            if total_minutes >= 90:
                return 100.0
            if total_minutes >= 45:
                return 90.0
            if total_minutes >= 25:
                return 60.0
            if total_minutes >= 10:
                return 20.0
            return 2.0  # heavily punish short videos

        elif intent == "beginner":
            if 10 <= total_minutes <= 25:
                return 100.0
            if 5 <= total_minutes < 10:
                return 70.0
            if 25 < total_minutes <= 40:
                return 60.0
            return 25.0

        else:
            if 5 <= total_minutes <= 45:
                return 80.0
            return 40.0
    except Exception:
        return 50.0


def score_view_popularity(views: int) -> float:
    if not views:
        return 10.0
    score = min(math.log10(views + 1) / 7 * 100, 100)
    return round(score, 2)


def compute_score(video: VideoResult, intent: str = "beginner") -> float:
    weights = INTENT_WEIGHTS.get(intent.lower(), INTENT_WEIGHTS["beginner"])

    engagement = score_engagement(video.views or 0, video.likes or 0)
    freshness = score_freshness(video.published_at)
    channel_trust = score_channel_trust(video.views or 0)
    duration_fit = score_duration_fit(video.duration, intent.lower())
    view_popularity = score_view_popularity(video.views or 0)

    composite = (
        weights["engagement"] * engagement
        + weights["freshness"] * freshness
        + weights["channel_trust"] * channel_trust
        + weights["duration_fit"] * duration_fit
        + weights["view_popularity"] * view_popularity
    )

    return round(composite, 1)


def compute_score_with_sentiment(video: VideoResult, intent: str = "beginner", sentiment_score: float = 50.0) -> float:
    base_score = compute_score(video, intent)
    final = (base_score * 0.75) + (sentiment_score * 0.25)
    return round(final, 1)


def rank_and_categorize(videos: list[VideoResult], intent: str = "beginner"):
    scored = []
    for video in videos:
        score = compute_score(video, intent)
        scored.append((video, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    results = []
    for i, (video, score) in enumerate(scored):
        label = CATEGORY_LABELS[i] if i < len(CATEGORY_LABELS) else None
        results.append({
            "video": video,
            "score": score,
            "label": label,
            "rank": i,
        })

    return results

def apply_content_analysis_adjustment(base_score: float, content_analysis: dict) -> float:
    """
    Adjust score based on transcript-derived content analysis.
    Heavily penalizes commentary/reaction videos masquerading as instructional content.
    """
    if not content_analysis:
        return base_score

    content_type = content_analysis.get("content_type", "unclear")
    explanation_quality = content_analysis.get("explanation_quality", 50.0)
    topic_match = content_analysis.get("topic_match", True)

    score = base_score

    # Heavy penalty if the video doesn't actually teach what the title claims
    if not topic_match:
        score *= 0.45  # cut score nearly in half

    # Penalty for commentary/reaction content when searching for learning material
    if content_type in ("commentary", "review", "entertainment"):
        score *= 0.7

    # Blend in explanation quality (from transcript) — 25% weight
    score = (score * 0.75) + (explanation_quality * 0.25)

    return round(min(score, 100), 1)   