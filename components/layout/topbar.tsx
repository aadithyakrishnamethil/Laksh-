'use client'

import { Bell, Search, ChevronDown } from 'lucide-react'
import * as Avatar from '@radix-ui/react-avatar'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types'

interface TopbarProps {
  profile?: Profile | null
}

export function Topbar({ profile }: TopbarProps) {
  const { setCommandPaletteOpen, devRole, setDevRole } = useUIStore()

  return (
    <header className="h-16 px-6 flex items-center gap-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0">
      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 flex-1 max-w-sm bg-[var(--bg-subtle)] rounded-[var(--radius-md)] px-3 py-2 text-[14px] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors cursor-text"
        aria-label="Open search (⌘K)"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 font-mono text-[var(--text-tertiary)]">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Dev Role Switcher */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-full px-3 py-1">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">DEV:</span>
          <select
            value={devRole}
            onChange={(e) => setDevRole(e.target.value as 'student' | 'parent' | 'teacher')}
            className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
      )}

      {/* Notifications */}
      <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent-red)] rounded-full" />
      </Button>

      {/* Avatar */}
      <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF]">
          <Avatar.Image
            src={profile?.avatar_url ?? undefined}
            alt={profile?.full_name ?? 'User'}
            className="w-full h-full object-cover"
          />
          <Avatar.Fallback className="flex items-center justify-center w-full h-full text-white text-[12px] font-semibold">
            {profile?.full_name?.charAt(0) ?? 'A'}
          </Avatar.Fallback>
        </Avatar.Root>
        <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
      </button>
    </header>
  )
}
