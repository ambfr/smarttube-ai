import React from 'react'

export default function Header() {
  return (
    <header className="w-full bg-[#0D0D14] border-b border-[#E8294C]/30 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#E8294C] rounded-md flex items-center justify-center">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="white" />
          </svg>
        </div>
        <span style={{fontFamily: "'Playfair Display', serif"}} className="font-bold text-white text-base tracking-tight italic">
          SmartTube <span className="text-[#E8294C]">AI</span>
        </span>
      </div>
      <nav className="flex gap-8">
        {['Discover', 'Trending', 'Saved'].map((item) => (
          <a key={item} href="#"
            className={`text-sm font-medium transition-colors ${
              item === 'Discover' ? 'text-[#E8294C]' : 'text-white/60 hover:text-white'
            }`}>
            {item}
          </a>
        ))}
      </nav>
    </header>
  )
}
