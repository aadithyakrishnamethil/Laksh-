'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Bell, Shield, User, ChevronRight, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import { SEED_STUDENT } from '@/lib/db/seed-data'

type Theme = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  { value: 'light',  label: 'Light',  icon: <Sun className="w-4 h-4" /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon className="w-4 h-4" /> },
]

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore()
  const [notifications, setNotifications] = useState({ daily: true, weekly: true, achievements: true, burnout: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">Manage your profile and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--accent-blue)]" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center text-white text-[20px] font-bold">
                {SEED_STUDENT.full_name.charAt(0)}
              </div>
              <div>
                <div className="text-[16px] font-semibold text-[var(--text-primary)]">{SEED_STUDENT.full_name}</div>
                <div className="text-[13px] text-[var(--text-secondary)]">{SEED_STUDENT.board} Class {SEED_STUDENT.class}</div>
                <Badge variant="blue" className="mt-1">Student</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Full name</label>
                <input
                  defaultValue={SEED_STUDENT.full_name}
                  className="w-full bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Board</label>
                <input
                  defaultValue={SEED_STUDENT.board}
                  disabled
                  className="w-full bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-3 py-2 text-[14px] text-[var(--text-secondary)] outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Exam date</label>
                <input
                  defaultValue={SEED_STUDENT.target_exam_date}
                  type="date"
                  className="w-full bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[var(--accent-orange)]" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-[var(--radius-lg)] border-2 transition-all ${
                    theme === opt.value
                      ? 'border-[var(--accent-blue)] bg-blue-50 dark:bg-blue-950/30'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent-blue)]/40'
                  }`}
                >
                  <div className={`${theme === opt.value ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'}`}>{opt.icon}</div>
                  <span className={`text-[13px] font-medium ${theme === opt.value ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'}`}>
                    {opt.label}
                  </span>
                  {theme === opt.value && <Check className="w-3.5 h-3.5 text-[var(--accent-blue)]" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.11 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-green)]" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => {
                const labels: Record<keyof typeof notifications, { title: string; desc: string }> = {
                  daily: { title: 'Daily reminders', desc: 'Study session reminders at your preferred time' },
                  weekly: { title: 'Weekly insights', desc: 'AI-generated weekly progress summary' },
                  achievements: { title: 'Achievement alerts', desc: 'Get notified when you earn badges and XP' },
                  burnout: { title: 'Burnout alerts', desc: 'Early warning when fatigue signs are detected' },
                }
                return (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                    <div>
                      <div className="text-[14px] font-medium text-[var(--text-primary)]">{labels[key].title}</div>
                      <div className="text-[12px] text-[var(--text-secondary)]">{labels[key].desc}</div>
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      className={`w-10 h-6 rounded-full transition-all relative ${val ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border-subtle)]'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.14 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {['Change Password', 'Download My Data', 'Delete Account'].map((item, i) => (
                <button
                  key={item}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-[var(--radius-lg)] hover:bg-[var(--bg-subtle)] transition-colors text-left ${i === 2 ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}
                >
                  <span className="text-[14px]">{item}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-end">
        <Button variant="primary" onClick={save} loading={saving}>
          {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
        </Button>
      </motion.div>
    </div>
  )
}
