import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { saveVideo, unsaveVideo } from '../services/savedApi'

function formatViews(views) {
  if (!views) return '—'
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`
  return `${views} views`
}

function formatDuration(iso) {
  if (!iso) return '—'
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '—'
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export default function VideoCard({ video, initiallySaved = false, onUnsave }) {
  const {
    title, channel, views, duration, thumbnail_url, video_id,
    score, label, rank, ai_tag,
    positive_signals = [], negative_signals = []
  } = video

  const { user } = useAuth()
  const [saved, setSaved] = useState(initiallySaved)
  const [saving, setSaving] = useState(false)

  const handleToggleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    setSaving(true)
    try {
      if (saved) {
        await unsaveVideo(video_id)
        setSaved(false)
        if (onUnsave) onUnsave(video_id)
      } else {
        await saveVideo(video)
        setSaved(true)
      }
    } catch (err) {
      console.error('Save toggle failed', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`bg-[#13131C] rounded-2xl p-4 flex gap-4 transition-all hover:bg-[#181822] ${
      rank === 0
        ? 'border border-[#E8294C]/60 shadow-[0_0_20px_rgba(232,41,76,0.1)]'
        : 'border border-white/8'
    }`}>
      {/* Thumbnail */}
      <a href={`https://youtube.com/watch?v=${video_id}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        <div className="w-28 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
          {thumbnail_url ? (
            <img src={thumbnail_url} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#E8294C] flex items-center justify-center">
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path d="M1 1L9 6L1 11V1Z" fill="white" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <a
            href={`https://youtube.com/watch?v=${video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white/90 leading-snug hover:text-[#E8294C] transition line-clamp-2"
            style={{fontFamily: "'Playfair Display', serif"}}
          >
            {title}
          </a>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {label && (
              <span className="text-xs bg-[#E8294C]/10 text-[#E8294C] border border-[#E8294C]/20 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                {label}
              </span>
            )}
            {user && (
              <button
                onClick={handleToggleSave}
                disabled={saving}
                title={saved ? 'Remove from saved' : 'Save video'}
                className="text-white/30 hover:text-[#E8294C] transition disabled:opacity-50"
              >
                {saved ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#E8294C">
                    <path d="M4 2C3.4 2 3 2.4 3 3V14L8 11L13 14V3C13 2.4 12.6 2 12 2H4Z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2C3.4 2 3 2.4 3 3V14L8 11L13 14V3C13 2.4 12.6 2 12 2H4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-white/30 mb-2.5">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="3" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 9C1 7.343 2.343 6 4 6H6C7.657 6 9 7.343 9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {channel}
          </span>
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M5 3V5.5L6.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatDuration(duration)}
          </span>
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5C1 5 2.5 2 5 2C7.5 2 9 5 9 5C9 5 7.5 8 5 8C2.5 8 1 5 1 5Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {formatViews(views)}
          </span>
        </div>

        {/* Score bar */}
        {score != null && (
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs text-white/25 italic">Score</span>
            <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8294C] rounded-full transition-all duration-500"
                style={{width: `${Math.min(score, 100)}%`}}
              />
            </div>
            <span className="text-xs font-semibold text-white/70">{Math.round(score)}</span>
          </div>
        )}

        {/* Sentiment chips */}
        {(positive_signals.length > 0 || negative_signals.length > 0 || ai_tag) && (
          <div className="flex gap-1.5 flex-wrap">
            {positive_signals.map((sig) => (
              <span key={sig} className="text-xs border border-white/10 text-white/40 px-2 py-0.5 rounded-full">
                ✓ {sig}
              </span>
            ))}
            {negative_signals.map((sig) => (
              <span key={sig} className="text-xs border border-white/8 text-white/25 px-2 py-0.5 rounded-full">
                — {sig}
              </span>
            ))}
            {ai_tag && positive_signals.length === 0 && (
              <span className="text-xs border border-white/10 text-white/40 px-2 py-0.5 rounded-full">
                ✓ {ai_tag}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
