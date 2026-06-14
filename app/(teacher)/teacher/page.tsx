import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Teacher Dashboard' }
export default function TeacherDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Teacher Dashboard</h1>
      <p className="text-[var(--text-secondary)] mb-8">Cohort analytics and per-student drill-down for your class.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">🎓</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Teacher Dashboard coming in Milestone 9</p>
        <p className="text-[var(--text-secondary)]">Class overview, at-risk students, cohort radar, AI Teacher Assistant.</p>
      </div>
    </div>
  )
}
