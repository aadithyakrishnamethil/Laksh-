import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Score Predictor' }
export default function PredictorPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Score Predictor</h1>
      <p className="text-[var(--text-secondary)] mb-8">AI-predicted board exam score with confidence and trend graph.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">📈</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Score Predictor coming in Milestone 3</p>
        <p className="text-[var(--text-secondary)]">Full prediction history, per-subject breakdown, risk alerts.</p>
      </div>
    </div>
  )
}
