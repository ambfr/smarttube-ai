import React from 'react'

function formatViews(views) {
  if (!views) return '—'
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
  return `${views}`
}

export default function ShortCard({ video }) {
  const { title, channel, views, thumbnail_url, video_id } = video

  return (
    <a
      href={`https://youtube.com/shorts/${video_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-32 group"
    >
      <div className="w-32 h-48 rounded-xl overflow-hidden bg-white/5 relative">
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
        <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
          Shorts
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-xs text-white font-medium line-clamp-2 leading-snug group-hover:text-[#E8294C] transition">
            {title}
          </p>
        </div>
      </div>
      <div className="mt-1.5 text-[11px] text-white/40 truncate">{channel}</div>
      <div className="text-[11px] text-white/25">{formatViews(views)} views</div>
    </a>
  )
}
