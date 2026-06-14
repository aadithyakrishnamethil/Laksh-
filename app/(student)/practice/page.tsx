import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Practice Papers' }
export default function PracticePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Practice Papers</h1>
      <p className="text-[var(--text-secondary)] mb-8">Subject-wise practice papers with timer and solution reveal.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">📝</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Practice Papers coming in Milestone 6</p>
        <p className="text-[var(--text-secondary)]">Timed quizzes, score analysis, chapter-wise filtering.</p>
      </div>
    </div>
  )
}
