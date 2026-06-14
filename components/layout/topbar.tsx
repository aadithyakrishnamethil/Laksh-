'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import * as Avatar from '@radix-ui/react-avatar'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface TopbarProps {
  profile?: Profile | null
  unreadNotifications?: number
}

interface NotificationItem {
  id: string
  title: string
  body: string
  read: boolean
  created_at: string
  type: string
}

export function Topbar({ profile, unreadNotifications = 0 }: TopbarProps) {
  const { setCommandPaletteOpen, devRole, setDevRole } = useUIStore()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(unreadNotifications)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('id, title, body, read, created_at, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) {
        setNotifications(data)
        // Mark all as read
        await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
        setUnread(0)
      }
    } catch {
      // Supabase not configured
    }
  }

  function handleBellClick() {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) fetchNotifications()
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    // Clear demo guest cookie so "Sign out" also exits demo mode
    document.cookie = 'laksh-demo=; path=/; max-age=0; samesite=lax'
    router.push('/login')
  }

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
      <div className="relative" ref={notifRef}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
          onClick={handleBellClick}
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-red)] rounded-full" />
          )}
        </Button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] shadow-xl border border-[var(--border-subtle)] z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[var(--text-secondary)]">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{n.title}</p>
                    {n.body && <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{n.body}</p>}
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar + user menu */}
      <div className="relative" ref={userRef}>
        <button
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
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

        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-surface)] rounded-[var(--radius-xl)] shadow-xl border border-[var(--border-subtle)] z-50 py-1.5 overflow-hidden">
            {profile && (
              <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{profile.full_name}</p>
                <p className="text-[11px] text-[var(--text-secondary)] capitalize">{profile.role}</p>
              </div>
            )}
            <button
              onClick={() => { setUserMenuOpen(false); router.push('/settings') }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--accent-red)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
