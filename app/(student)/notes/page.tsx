import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Notes' }
export default function NotesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Notes</h1>
      <p className="text-[var(--text-secondary)] mb-8">AI-generated and manual revision notes by chapter.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">📒</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Notes coming in Milestone 5</p>
        <p className="text-[var(--text-secondary)]">AI-generated structured notes, manual editing, markdown view.</p>
      </div>
    </div>
  )
}
