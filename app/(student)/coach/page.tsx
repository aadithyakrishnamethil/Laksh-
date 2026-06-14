import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'AI Coach' }
export default function CoachPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">AI Learning Coach</h1>
      <p className="text-[var(--text-secondary)] mb-8">Your personal AI coach for study advice, motivation, and subject help.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">💬</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">AI Coach Chat coming in Milestone 5</p>
        <p className="text-[var(--text-secondary)]">Streaming chat, conversation history, context-aware coaching.</p>
      </div>
    </div>
  )
}
