from datetime import datetime, timezone
import math
import re
from app.models.video import VideoResult

# Intent weight maps — different multipliers per scoring dimension per intent
INTENT_WEIGHTS = {
    "beginner": {
        "engagement": 0.2,
        "freshness": 0.1,
        "channel_trust": 0.2,
        "duration_fit": 0.3,   # shorter, clearer videos preferred
        "view_popularity": 0.2,
    },
    "advanced": {
        "engagement": 0.2,
        "freshness": 0.3,      # recency matters more
        "channel_trust": 0.3,
        "duration_fit": 0.1,
        "view_popularity": 0.1,
    },
    "quick summary": {
        "engagement": 0.2,
        "freshness": 0.2,
        "channel_trust": 0.1,
        "duration_fit": 0.4,   # short duration is key
        "view_popularity": 0.1,
    },
    "detailed": {
        "engagement": 0.2,
        "freshness": 0.1,
        "channel_trust": 0.2,
        "duration_fit": 0.3,   # longer = more comprehensive
        "view_popularity": 0.2,
    },
    "review": {
        "engagement": 0.3,
        "freshness": 0.2,
        "channel_trust": 0.4,
        "duration_fit": 0.0,
        "view_popularity": 0.1,
    },
    "news": {
        "engagement": 0.1,
        "freshness": 0.6,      # freshness is everything
        "channel_trust": 0.2,
        "duration_fit": 0.0,
        "view_popularity": 0.1,
    },
}

CATEGORY_LABELS = ["Best overall", "Quick learning", "Best for beginners", "Most detailed"]


def score_engagement(views: int, likes: int) -> float:
    """Likes/views ratio normalized to 0-100."""
    if not views or not likes:
        return 30.0
    ratio = likes / views
    # Most good videos sit between 2-8% like rate
    normalized = min(ratio / 0.05, 1.0)
    return round(normalized * 100, 2)


def score_freshness(published_at: str) -> float:
    """Recency decay — newer videos score higher."""
    if not published_at:
        return 30.0
    try:
        pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days_old = (now - pub_date).days
        # Decay curve: 100 at 0 days, ~50 at 1 year, ~20 at 3 years
        score = 100 * math.exp(-0.002 * days_old)
        return round(max(score, 5.0), 2)
    except Exception:
        return 30.0


def score_channel_trust(views: int) -> float:
    """Proxy channel trust via view count (until we fetch subscriber data)."""
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
    """Score duration based on what the intent needs."""
    if not iso_duration:
        return 50.0
    try:
        match = __import__("re").match(
            r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_duration
        )
        if not match:
            return 50.0
        h = int(match.group(1) or 0)
        m = int(match.group(2) or 0)
        total_minutes = h * 60 + m

        if intent in ("quick summary",):
            # Ideal: under 10 min
            if total_minutes <= 5:
                return 100.0
            if total_minutes <= 10:
                return 80.0
            if total_minutes <= 20:
                return 50.0
            return 20.0

        elif intent in ("detailed",):
            # Ideal: over 30 min
            if total_minutes >= 60:
                return 100.0
            if total_minutes >= 30:
                return 80.0
            if total_minutes >= 15:
                return 50.0
            return 20.0

        elif intent in ("beginner",):
            # Ideal: 10-30 min
            if 10 <= total_minutes <= 30:
                return 100.0
            if total_minutes < 10:
                return 60.0
            return 70.0

        else:
            # Neutral — moderate length is fine
            if 5 <= total_minutes <= 45:
                return 80.0
            return 50.0
    except Exception:
        return 50.0


def score_view_popularity(views: int) -> float:
    """Log-normalized view count score."""
    if not views:
        return 10.0
    score = min(math.log10(views + 1) / 7 * 100, 100)
    return round(score, 2)


def compute_score(video: VideoResult, intent: str = "beginner") -> float:
    """Compute weighted composite score for a video given an intent."""
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


def rank_and_categorize(videos: list[VideoResult], intent: str = "beginner"):
    """Score, sort, and assign category labels to videos."""
    scored = []
    for video in videos:
        score = compute_score(video, intent)
        scored.append((video, score))

    # Sort by score descending
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


def compute_score_with_sentiment(video: VideoResult, intent: str = "beginner", sentiment_score: float = 50.0) -> float:
    """Composite score including sentiment from comments."""
    base_score = compute_score(video, intent)
    # Blend base score (80%) with sentiment score (20%)
    final = (base_score * 0.8) + (sentiment_score * 0.2)
    return round(final, 1)


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


def is_short_video(iso_duration: str) -> bool:
    """Detect if a video is likely a YouTube Short (60 seconds or under)."""
    if not iso_duration:
        return False
    try:
        match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_duration)
        if not match:
            return False
        h = int(match.group(1) or 0)
        m = int(match.group(2) or 0)
        s = int(match.group(3) or 0)
        total_seconds = h * 3600 + m * 60 + s
        return total_seconds <= 60 and total_seconds > 0
    except Exception:
        return False
