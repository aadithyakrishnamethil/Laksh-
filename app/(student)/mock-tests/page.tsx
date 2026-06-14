import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mock Tests' }
export default function MockTestsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Mock Tests</h1>
      <p className="text-[var(--text-secondary)] mb-8">Full CBSE board exam simulator with rank and time analysis.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">🎓</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Mock Tests coming in Milestone 6</p>
        <p className="text-[var(--text-secondary)]">Timed board exam simulation, percentile, predicted rank, detailed analysis.</p>
      </div>
    </div>
  )
}
