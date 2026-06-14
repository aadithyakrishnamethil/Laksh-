import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Goals' }
export default function GoalsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">My Goals</h1>
      <p className="text-[var(--text-secondary)] mb-8">Set and track your CBSE Class 12 board exam targets.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">🎯</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Goal Setter coming in Milestone 1</p>
        <p className="text-[var(--text-secondary)]">AI will break your target score into per-subject goals with effort estimates.</p>
      </div>
    </div>
  )
}
