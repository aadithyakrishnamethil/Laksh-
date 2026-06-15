'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMPULSORY_SUBJECT, DEFAULT_SUBJECT_IDS, MAX_SUBJECTS } from '@/lib/utils/constants'

interface SubjectsState {
  /** The subject ids the student is studying (always includes the compulsory subject). */
  selectedSubjectIds: string[]
  /** Toggle a subject on/off, enforcing the compulsory subject and the max-count rule. */
  toggleSubject: (id: string) => void
  /** Replace the whole selection (used by onboarding). */
  setSubjects: (ids: string[]) => void
}

/** Guarantee English is present and the list never exceeds MAX_SUBJECTS. */
function normalise(ids: string[]): string[] {
  const unique = Array.from(new Set(ids))
  const withCompulsory = unique.includes(COMPULSORY_SUBJECT)
    ? unique
    : [COMPULSORY_SUBJECT, ...unique]
  if (withCompulsory.length <= MAX_SUBJECTS) return withCompulsory
  // Trim extras but never drop the compulsory subject.
  const trimmed = withCompulsory.filter((id) => id !== COMPULSORY_SUBJECT).slice(0, MAX_SUBJECTS - 1)
  return [COMPULSORY_SUBJECT, ...trimmed]
}

export const useSubjectsStore = create<SubjectsState>()(
  persist(
    (set) => ({
      selectedSubjectIds: normalise(DEFAULT_SUBJECT_IDS),
      toggleSubject: (id) =>
        set((s) => {
          // English is compulsory — it can't be toggled off.
          if (id === COMPULSORY_SUBJECT) return s
          const selected = s.selectedSubjectIds.includes(id)
          if (selected) {
            return { selectedSubjectIds: s.selectedSubjectIds.filter((x) => x !== id) }
          }
          // Adding — respect the maximum.
          if (s.selectedSubjectIds.length >= MAX_SUBJECTS) return s
          return { selectedSubjectIds: [...s.selectedSubjectIds, id] }
        }),
      setSubjects: (ids) => set({ selectedSubjectIds: normalise(ids) }),
    }),
    {
      name: 'laksh-subjects',
      // Re-normalise on load in case persisted data predates the rules.
      onRehydrateStorage: () => (state) => {
        if (state) state.selectedSubjectIds = normalise(state.selectedSubjectIds)
      },
    }
  )
)
