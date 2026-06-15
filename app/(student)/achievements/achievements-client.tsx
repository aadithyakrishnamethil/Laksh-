'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Flame } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AchievementsData } from '@/lib/db/queries'

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 }
const TIER_VARIANT: Record<string, 'platinum' | 'gold' | 'silver' | 'bronze'> = {
  platinum: 'platinum', gold: 'gold', silver: 'silver', bronze: 'bronze',
}

const XP_PER_LEVEL = 500

interface AchievementsClientProps {
  data: AchievementsData
}

export function AchievementsClient({ data }: AchievementsClientProps) {
  const { achievements, totalXp, level, currentStreak } = data

  const sorted = useMemo(
    () =>
      [...achievements].sort((a, b) => {
        const aEarned = a.earned ? 0 : 1
        const bEarned = b.earned ? 0 : 1
        if (aEarned !== bEarned) return aEarned - bEarned
        return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9)
      }),
    [achievements]
  )

  const earnedCount = achievements.filter((a) => a.earned).length
  const xpInLevel = totalXp % XP_PER_LEVEL

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
          <div className="text-[28px] font-bold text-[var(--text-primary)]">{totalXp.toLocaleString()}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">Total XP</div>
        </Card>
        <Card className="flex flex-col items-center py-6 gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F0A] to-[#FF3B30] flex items-center justify-center mb-1">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-[28px] font-bold text-[var(--text-primary)]">{currentStreak}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">Day Streak</div>
        </Card>
        <Card className="flex flex-col items-center py-6 gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34C759] to-[#2A7AFE] flex items-center justify-center mb-1">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-[28px] font-bold text-[var(--text-primary)]">Level {level}</div>
          <div className="text-[13px] text-[var(--text-secondary)]">{xpInLevel}/{XP_PER_LEVEL} XP to next</div>
        </Card>
      </motion.div>

      {/* Level progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">Level {level} progress</span>
          <span className="text-[13px] text-[var(--text-secondary)]">{xpInLevel}/{XP_PER_LEVEL} XP</span>
        </div>
        <div className="h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
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
              {earnedCount}/{achievements.length} earned
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sorted.map((ach, i) => (
                <motion.div
                  key={ach.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: ach.earned ? 1 : 0.45, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex flex-col items-center gap-2 p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-xl)] text-center relative"
                >
                  <div className={`text-[40px] ${ach.earned ? '' : 'grayscale'}`}>{ach.icon}</div>
                  <Badge variant={TIER_VARIANT[ach.tier]}>{ach.tier}</Badge>
                  <h4 className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">{ach.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{ach.desc}</p>
                  {!ach.earned && (
                    <div className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--bg-surface)]/40 flex items-center justify-center">
                      <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full">Locked</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
