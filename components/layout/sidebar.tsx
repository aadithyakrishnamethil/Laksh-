'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  FlaskConical,
  BookOpen,
  Trophy,
  Medal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  GraduationCap,
  BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'

const STUDENT_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'My Goals', icon: Target },
  { href: '/predictor', label: 'Score Predictor', icon: TrendingUp },
  { href: '/planner', label: 'Study Planner', icon: Calendar },
  { href: '/diagnostics', label: 'Diagnostics', icon: BarChart3 },
  { href: '/coach', label: 'AI Coach', icon: MessageSquare },
  { href: '/practice', label: 'Practice', icon: FileText },
  { href: '/mock-tests', label: 'Mock Tests', icon: FlaskConical },
  { href: '/revision', label: 'Revision', icon: BookOpen },
  { href: '/notes', label: 'Notes', icon: BookMarked },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Medal },
]

const PARENT_NAV = [
  { href: '/parent', label: 'Dashboard', icon: LayoutDashboard },
]

const TEACHER_NAV = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
]

const ROLE_NAV = {
  student: STUDENT_NAV,
  parent: PARENT_NAV,
  teacher: TEACHER_NAV,
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, devRole } = useUIStore()
  const pathname = usePathname()
  const nav = ROLE_NAV[devRole] ?? STUDENT_NAV

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border-subtle)] shrink-0">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight"
            >
              Laksh
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-[14px] font-medium transition-all duration-150',
                active
                  ? 'bg-gradient-to-r from-blue-50 to-sky-50 text-[var(--accent-blue)] dark:from-blue-950/50 dark:to-sky-950/50'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[var(--border-subtle)] p-2 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-[14px] font-medium transition-all duration-150',
            pathname === '/settings'
              ? 'bg-gradient-to-r from-blue-50 to-sky-50 text-[var(--accent-blue)] dark:from-blue-950/50 dark:to-sky-950/50'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Settings</motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
