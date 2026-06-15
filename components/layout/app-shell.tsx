'use client'

import { useEffect } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'
import { AICopilotOrb } from '@/components/ai-orb'
import { useGoalStore } from '@/stores/goal-store'
import type { Profile } from '@/types'
import type { GoalData } from '@/lib/db/queries'

interface AppShellProps {
  profile?: Profile | null
  unreadNotifications?: number
  initialGoal?: GoalData | null
  children: React.ReactNode
}

export function AppShell({ profile, unreadNotifications = 0, initialGoal, children }: AppShellProps) {
  useTheme()
  const hydrate = useGoalStore((s) => s.hydrate)

  // Hydrate the goal store from server-fetched data on every mount.
  // This keeps localStorage in sync with the database after login / page refresh.
  // Only overwrite from real (authenticated) DB data — in demo mode the seed
  // fallback would otherwise clobber a goal the user saved locally.
  useEffect(() => {
    if (initialGoal && initialGoal.isRealData) {
      hydrate({
        targetPct: initialGoal.targetPct,
        subjectBreakdowns: initialGoal.subjectBreakdowns,
        updatedAt: initialGoal.updatedAt,
      })
    }
  }, [initialGoal, hydrate])

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar profile={profile} unreadNotifications={unreadNotifications} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
      <CommandPalette />
      <AICopilotOrb />
    </div>
  )
}
