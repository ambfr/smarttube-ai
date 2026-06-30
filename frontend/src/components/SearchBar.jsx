import React, { useState } from 'react'

const TIPS = [
  'Be specific with your search — try "beginner sourdough bread recipe" instead of just "baking".',
  'Scores aren\'t based on views or likes alone — we actually read comments and the video content to judge quality.',
  'Tap "What\'s in this video?" on any result to see a quick summary before you click play.',
  'Videos that just talk *about* a topic (reviews, reactions, opinions) rank lower than ones that actually teach or show it.',
]

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [tipsOpen, setTipsOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          placeholder="Search any topic — e.g. Learn Python"
          className="w-full bg-[#13131C] text-white placeholder-white/25 border border-white/10 rounded-xl pl-10 pr-12 py-3.5 text-sm outline-none focus:border-[#E8294C]/50 focus:ring-1 focus:ring-[#E8294C]/30 transition"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Tips toggle */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => setTipsOpen(!tipsOpen)}
          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4.3 4.2C4.3 3.5 4.85 3 5.5 3C6.15 3 6.7 3.5 6.7 4.1C6.7 4.7 6.2 4.95 5.8 5.2C5.5 5.4 5.5 5.7 5.5 6"
              stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="5.5" cy="7.6" r="0.4" fill="currentColor" />
          </svg>
          How to get the best results
        </button>
      </div>

      {tipsOpen && (
        <div className="mt-3 bg-[#13131C] border border-white/8 rounded-xl p-4">
          <ul className="space-y-2">
            {TIPS.map((tip, i) => (
              <li key={i} className="text-xs text-white/45 leading-relaxed flex gap-2">
                <span className="text-[#E8294C] flex-shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}