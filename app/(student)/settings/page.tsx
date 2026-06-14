import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }
export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">Settings</h1>
      <p className="text-[var(--text-secondary)] mb-8">Manage your profile, preferences, and linked accounts.</p>
      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="text-[48px] mb-4">⚙️</div>
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Settings coming in Milestone 10</p>
        <p className="text-[var(--text-secondary)]">Theme, profile, notification preferences, account management.</p>
      </div>
    </div>
  )
}
