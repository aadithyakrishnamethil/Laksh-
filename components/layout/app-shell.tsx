'use client'

import { useEffect } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from './command-palette'
import type { Profile } from '@/types'

interface AppShellProps {
  profile?: Profile | null
  children: React.ReactNode
}

export function AppShell({ profile, children }: AppShellProps) {
  useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
