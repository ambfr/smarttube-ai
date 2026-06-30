import React, { useState } from 'react'

const FILTERS = ['Beginner', 'Advanced', 'Quick summary', 'Detailed', 'Review', 'News']

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Beginner')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim(), activeFilter.toLowerCase())
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative mb-3">
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

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeFilter === filter
                ? 'bg-[#E8294C] text-white border-[#E8294C]'
                : 'bg-transparent text-white/50 border-white/15 hover:border-[#E8294C]/50 hover:text-white/80'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
