import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Study Planner' }
export default function PlannerPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Study Planner</h1>
      <p className="text-[var(--text-secondary)] mb-8">Your AI-generated daily and weekly study plan.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">📅</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Study Planner coming in Milestone 4</p>
        <p className="text-[var(--text-secondary)]">Calendar + list views, task completion, smart rescheduling.</p>
      </div>
    </div>
  )
}
