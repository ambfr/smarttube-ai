import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Header({ activeView, onNavigate }) {
  const { user, logoutUser } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = ['Discover', 'Saved']

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

      <div className="flex items-center gap-8">
        <nav className="flex gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className={`text-sm font-medium transition-colors ${
                activeView === item.toLowerCase() ? 'text-[#E8294C]' : 'text-white/60 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-[#E8294C] flex items-center justify-center text-white text-xs font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-[#13131C] border border-white/10 rounded-xl py-2 w-44 shadow-xl z-10">
                <div className="px-3 py-1.5 text-xs text-white/40 border-b border-white/10 mb-1">
                  {user.email}
                </div>
                <button
                  onClick={() => { logoutUser(); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 transition"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#E8294C] hover:bg-[#C9203E] text-white text-sm font-medium px-4 py-1.5 rounded-full transition"
          >
            Sign in
          </button>
        )}
      </div>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  )
}
