import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Leaderboard' }
export default function LeaderboardPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Leaderboard</h1>
      <p className="text-[var(--text-secondary)] mb-8">Class and global rankings by XP earned.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">🏆</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Leaderboard coming in Milestone 7</p>
        <p className="text-[var(--text-secondary)]">Real-time XP rankings with Supabase Realtime.</p>
      </div>
    </div>
  )
}
