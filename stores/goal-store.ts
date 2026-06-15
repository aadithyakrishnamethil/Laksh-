'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Feasibility } from '@/types'

export interface SubjectBreakdown {
  targetPct: number
  requiredEffortHrs: number
  feasibility: Feasibility
  rationale: string
}

interface GoalState {
  targetPct: number
  subjectBreakdowns: Record<string, SubjectBreakdown>
  updatedAt: string | null
  /** Overwrite store from authoritative server data (called on layout mount). */
  hydrate: (data: { targetPct: number; subjectBreakdowns: Record<string, SubjectBreakdown>; updatedAt: string | null }) => void
  /** Apply a saved goal (after server action succeeds). */
  setGoal: (targetPct: number, subjectBreakdowns: Record<string, SubjectBreakdown>, updatedAt: string) => void
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      targetPct: 85,
      subjectBreakdowns: {},
      updatedAt: null,
      hydrate: (data) => set(data),
      setGoal: (targetPct, subjectBreakdowns, updatedAt) =>
        set({ targetPct, subjectBreakdowns, updatedAt }),
    }),
    { name: 'laksh-goal' }
  )
)
