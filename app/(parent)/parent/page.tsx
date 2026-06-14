import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Parent Dashboard' }
export default function ParentDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Parent Dashboard</h1>
      <p className="text-[var(--text-secondary)] mb-8">Monitor your child's CBSE Class 12 preparation progress.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">👪</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Parent Dashboard coming in Milestone 9</p>
        <p className="text-[var(--text-secondary)]">Progress overview, predicted score, burnout alerts, AI Parent Assistant.</p>
      </div>
    </div>
  )
}
