'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Target, TrendingUp, Calendar, BarChart3,
  MessageSquare, FileText, FlaskConical, BookOpen, Trophy,
  Medal, Settings, Search, BookMarked, Sparkles,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useKeyboard } from '@/hooks/use-keyboard'

const COMMANDS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigate' },
  { label: 'My Goals', href: '/goals', icon: Target, group: 'Navigate' },
  { label: 'Score Predictor', href: '/predictor', icon: TrendingUp, group: 'Navigate' },
  { label: 'Study Planner', href: '/planner', icon: Calendar, group: 'Navigate' },
  { label: 'Diagnostics', href: '/diagnostics', icon: BarChart3, group: 'Navigate' },
  { label: 'AI Coach', href: '/coach', icon: MessageSquare, group: 'Navigate' },
  { label: 'Practice Papers', href: '/practice', icon: FileText, group: 'Navigate' },
  { label: 'Mock Tests', href: '/mock-tests', icon: FlaskConical, group: 'Navigate' },
  { label: 'Revision Center', href: '/revision', icon: BookOpen, group: 'Navigate' },
  { label: 'Notes', href: '/notes', icon: BookMarked, group: 'Navigate' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, group: 'Navigate' },
  { label: 'Achievements', href: '/achievements', icon: Medal, group: 'Navigate' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'Navigate' },
  { label: 'Set a New Goal', href: '/goals?action=new', icon: Target, group: 'Quick Actions' },
  { label: 'Start AI Coach Chat', href: '/coach?action=new', icon: Sparkles, group: 'Quick Actions' },
  { label: 'Take Diagnostic', href: '/diagnostics?action=start', icon: BarChart3, group: 'Quick Actions' },
  { label: 'Generate Flashcards', href: '/revision?action=flashcards', icon: BookMarked, group: 'Quick Actions' },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const router = useRouter()

  useKeyboard([
    {
      key: 'k',
      modifiers: ['ctrl'],
      handler: () => setCommandPaletteOpen(!commandPaletteOpen),
      description: 'Open command palette',
    },
    {
      key: 'Escape',
      handler: () => setCommandPaletteOpen(false),
      description: 'Close command palette',
    },
  ])

  const runCommand = useCallback((href: string) => {
    setCommandPaletteOpen(false)
    router.push(href)
  }, [router, setCommandPaletteOpen])

  const groups = Array.from(new Set(COMMANDS.map((c) => c.group)))

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <Command
              className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-dropdown)] border border-[var(--border-subtle)] overflow-hidden"
              label="Command palette"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
                <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Search or jump to…"
                  className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                />
                <kbd className="text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-subtle)] rounded px-1.5 py-0.5 font-mono">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-[14px] text-[var(--text-secondary)]">
                  No results found.
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--text-tertiary)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                    {COMMANDS.filter((c) => c.group === group).map((cmd) => (
                      <Command.Item
                        key={cmd.href}
                        value={cmd.label}
                        onSelect={() => runCommand(cmd.href)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-[14px] text-[var(--text-primary)] cursor-pointer data-[selected=true]:bg-[var(--bg-subtle)] transition-colors"
                      >
                        <cmd.icon className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                        {cmd.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
