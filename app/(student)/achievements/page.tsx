'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Flame } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ACHIEVEMENT_DEFS, XP_REWARDS } from '@/lib/utils/constants'
import { SEED_XP, SEED_LEVEL, SEED_STREAK } from '@/lib/db/seed-data'

const EARNED_CODES = ['first_login', 'goal_set', 'diagnostic_done', 'xp_500', 'streak_7', 'week_challenge']

const TIER_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 }
const TIER_VARIANT: Record<string, 'platinum' | 'gold' | 'silver' | 'bronze'> = {
  platinum: 'platinum', gold: 'gold', silver: 'silver', bronze: 'bronze',
}

const sorted = [...ACHIEVEMENT_DEFS].sort((a, b) => {
  const aEarned = EARNED_CODES.includes(a.code) ? 0 : 1
  const bEarned = EARNED_CODES.includes(b.code) ? 0 : 1
  if (aEarned !== bEarned) return aEarned - bEarned
  return TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
})

const xpToNextLevel = 500
const xpInLevel = SEED_XP % xpToNextLevel

export default function AchievementsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Achievements</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">Badges earned on your CBSE prep journey</p>
      </motion.div>

      {/* XP + Streak summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="flex flex-col items-center py-6 gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center mb-1">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-[28px] font-bold text-[var(--text-primary)]">{SEED_XP.toLocaleString()}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">Total XP</div>
        </Card>
        <Card className="flex flex-col items-center py-6 gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F0A] to-[#FF3B30] flex items-center justify-center mb-1">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-[28px] font-bold text-[var(--text-primary)]">{SEED_STREAK.current}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">Day Streak</div>
        </Card>
        <Card className="flex flex-col items-center py-6 gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34C759] to-[#2A7AFE] flex items-center justify-center mb-1">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-[28px] font-bold text-[var(--text-primary)]">Level {SEED_LEVEL}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">{xpInLevel}/{xpToNextLevel} XP to next</div>
        </Card>
      </motion.div>

      {/* Level progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">Level {SEED_LEVEL} progress</span>
          <span className="text-[13px] text-[var(--text-secondary)]">{xpInLevel}/{xpToNextLevel} XP</span>
        </div>
        <div className="h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(xpInLevel / xpToNextLevel) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#2A7AFE] to-[#53C8FF]"
          />
        </div>
      </motion.div>

      {/* Badge grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <span className="text-[13px] text-[var(--text-secondary)]">
              {EARNED_CODES.length}/{ACHIEVEMENT_DEFS.length} earned
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sorted.map((ach, i) => {
                const earned = EARNED_CODES.includes(ach.code)
                return (
                  <motion.div
                    key={ach.code}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: earned ? 1 : 0.45, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-xl)] text-center relative"
                  >
                    <div className={`text-[40px] ${earned ? '' : 'grayscale'}`}>{ach.icon}</div>
                    <Badge variant={TIER_VARIANT[ach.tier]}>{ach.tier}</Badge>
                    <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{ach.title}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{ach.desc}</p>
                    {!earned && (
                      <div className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--bg-surface)]/40 flex items-center justify-center">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">Locked</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
