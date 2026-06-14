import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Revision Center' }
export default function RevisionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Revision Center</h1>
      <p className="text-[var(--text-secondary)] mb-8">AI-powered revision queue, flashcards, notes, and doubt solver.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">📖</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Revision Center coming in Milestone 5</p>
        <p className="text-[var(--text-secondary)]">Spaced-repetition flashcards, AI notes, doubt solver, revision queue.</p>
      </div>
    </div>
  )
}
