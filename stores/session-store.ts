'use client'

import { create } from 'zustand'

interface FocusSession {
  active: boolean
  startedAt: number | null
  distractions: number
}

interface QuizState {
  active: boolean
  questionIndex: number
  answers: Record<number, number>
  startedAt: number | null
}

interface SessionState {
  focus: FocusSession
  startFocus: () => void
  endFocus: () => { durationMs: number; distractions: number } | null
  addDistraction: () => void

  quiz: QuizState
  startQuiz: () => void
  answerQuestion: (idx: number, chosenOption: number) => void
  nextQuestion: () => void
  endQuiz: () => void
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  focus: { active: false, startedAt: null, distractions: 0 },
  startFocus: () => set({ focus: { active: true, startedAt: Date.now(), distractions: 0 } }),
  endFocus: () => {
    const { focus } = get()
    if (!focus.active || !focus.startedAt) return null
    const result = { durationMs: Date.now() - focus.startedAt, distractions: focus.distractions }
    set({ focus: { active: false, startedAt: null, distractions: 0 } })
    return result
  },
  addDistraction: () =>
    set((s) => ({ focus: { ...s.focus, distractions: s.focus.distractions + 1 } })),

  quiz: { active: false, questionIndex: 0, answers: {}, startedAt: null },
  startQuiz: () => set({ quiz: { active: true, questionIndex: 0, answers: {}, startedAt: Date.now() } }),
  answerQuestion: (idx, chosen) =>
    set((s) => ({ quiz: { ...s.quiz, answers: { ...s.quiz.answers, [idx]: chosen } } })),
  nextQuestion: () =>
    set((s) => ({ quiz: { ...s.quiz, questionIndex: s.quiz.questionIndex + 1 } })),
  endQuiz: () =>
    set({ quiz: { active: false, questionIndex: 0, answers: {}, startedAt: null } }),
}))
