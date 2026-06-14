import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Diagnostics' }
export default function DiagnosticsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Diagnostic Assessment</h1>
      <p className="text-[var(--text-secondary)] mb-8">Adaptive test to map your chapter-wise mastery.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">🔍</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Adaptive Diagnostics coming in Milestone 3</p>
        <p className="text-[var(--text-secondary)]">IRT-based adaptive test with chapter mastery map and weakness detection.</p>
      </div>
    </div>
  )
}
