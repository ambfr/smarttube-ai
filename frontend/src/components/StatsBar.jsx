import React from 'react'

export default function StatsBar({ count, query, topScore, commentsRead }) {
  if (!query) return null

  return (
    <div className="w-full border-t border-white/8 mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
      {[
        { value: topScore ? Math.round(topScore) : '—', label: 'Top score' },
        { value: count || '—', label: 'Analyzed' },
        { value: commentsRead || '—', label: 'Comments read' },
        { value: '~5s', label: 'Analysis time' },
      ].map((stat) => (
        <div key={stat.label}>
          <div className="text-2xl font-bold text-white/90">{stat.value}</div>
          <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
