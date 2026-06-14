'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemePref, UserRole } from '@/types'

interface UIState {
  theme: ThemePref
  setTheme: (t: ThemePref) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  // dev-only role switcher
  devRole: UserRole
  setDevRole: (role: UserRole) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      devRole: 'student',
      setDevRole: (devRole) => set({ devRole }),
    }),
    {
      name: 'laksh-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed, devRole: state.devRole }),
    }
  )
)
