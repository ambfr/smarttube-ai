import React, { useState } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import VideoCard from './components/VideoCard'
import ShortCard from './components/ShortCard'
import StatsBar from './components/StatsBar'
import SavedPage from './components/SavedPage'
import { rankVideos } from './services/api'

export default function App() {
  const [view, setView] = useState('discover')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [topScore, setTopScore] = useState(null)
  const [commentsRead, setCommentsRead] = useState(0)
  const [shorts, setShorts] = useState([])

  const handleSearch = async (q) => {
    setLoading(true)
    setError(null)
    setQuery(q)
    try {
      const data = await rankVideos(q, 'beginner')
      setVideos(data.results || [])
      setTopScore(data.top_score || null)
      setCommentsRead(data.total_comments_read || 0)
      setShorts(data.shorts || [])
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] flex flex-col">
      <Header activeView={view} onNavigate={setView} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-4 py-8 sm:py-12">
        {view === 'discover' && (
          <>
            {/* Hero */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-xs text-white/60 px-3 py-1 rounded-full mb-4 sm:mb-5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L6.2 3.8L9 4.1L7 6.1L7.5 9L5 7.5L2.5 9L3 6.1L1 4.1L3.8 3.8L5 1Z" fill="#E8294C" />
                </svg>
                AI-ranked video results
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-3"
                style={{fontFamily: "'Playfair Display', serif"}}>
                Find the{' '}
                <em className="text-[#E8294C]"
                  style={{fontFamily: "'Playfair Display', serif", fontStyle: "italic"}}>
                  best
                </em>{' '}
                video,<br />
                not just the most popular
              </h1>
              <p className="text-xs sm:text-sm text-white/40 max-w-sm mx-auto px-2">
                SmartTube ranks YouTube results by quality, clarity, and credibility — not clicks.
              </p>
            </div>

            <SearchBar onSearch={handleSearch} loading={loading} />

            <div className="mt-8">
              {loading && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-white/30 text-center mb-2">Reading comments and analyzing videos...</p>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#161616] border border-white/8 rounded-2xl p-4 flex gap-4 animate-pulse">
                      <div className="w-28 h-20 rounded-xl bg-white/5 flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                        <div className="h-2 bg-white/5 rounded w-full mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-center py-10 text-sm text-red-400">{error}</div>
              )}

              {!loading && !error && videos.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-white/40">
                      Showing <span className="font-semibold text-white/80">{videos.length} ranked results</span> for "{query}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {videos.map((video) => (
                      <VideoCard key={video.video_id} video={video} />
                    ))}
                  </div>
                </>
              )}

              {!loading && !error && videos.length === 0 && query && (
                <div className="text-center py-16 text-sm text-white/30">
                  No results found for "{query}". Try a different search.
                </div>
              )}

              {!loading && shorts.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs text-white/40 mb-3 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="3" y="1" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 4.5L7.5 6L5 7.5V4.5Z" fill="currentColor" />
                    </svg>
                    Shorts for "{query}"
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                    {shorts.map((short) => (
                      <ShortCard key={short.video_id} video={short} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <StatsBar count={videos.length} query={query} topScore={topScore} commentsRead={commentsRead} />
          </>
        )}

        {view === 'saved' && <SavedPage />}

        {view === 'trending' && <TrendingPage />}
      </main>

      <footer className="text-center text-xs text-white/20 py-4 border-t border-white/8">
        Powered by Groq + YouTube Data API
      </footer>
    </div>
  )
}
