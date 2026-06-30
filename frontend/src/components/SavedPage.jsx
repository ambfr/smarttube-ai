import React, { useState, useEffect } from 'react'
import VideoCard from './VideoCard'
import { getSavedVideos } from '../services/savedApi'
import { useAuth } from '../context/AuthContext'

export default function SavedPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getSavedVideos()
      .then((data) => setSaved(data.saved || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false))
  }, [user])

  const handleUnsave = (videoId) => {
    setSaved((prev) => prev.filter((v) => v.video_id !== videoId))
  }

  if (!user) {
    return (
      <div className="text-center py-24 text-white/40 text-sm">
        Sign in to see your saved videos.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#13131C] border border-white/8 rounded-2xl p-4 flex gap-4 animate-pulse">
            <div className="w-28 h-20 rounded-xl bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (saved.length === 0) {
    return (
      <div className="text-center py-24 text-white/40 text-sm">
        No saved videos yet. Bookmark videos from your search results to see them here.
      </div>
    )
  }

  return (
    <div>
      <h2
        className="text-xl font-bold text-white mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Your saved videos
      </h2>
      <div className="flex flex-col gap-3">
        {saved.map((video) => (
          <VideoCard
            key={video.video_id}
            video={video}
            initiallySaved={true}
            onUnsave={handleUnsave}
          />
        ))}
      </div>
    </div>
  )
}
