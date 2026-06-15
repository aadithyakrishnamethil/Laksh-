'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LeaderboardData, LeaderboardRow } from '@/lib/db/queries'

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Crown className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-slate-400" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({ row, size }: { row: LeaderboardRow; size: number }) {
  const dim = `${size}px`
  if (row.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={row.avatar_url}
        alt={row.full_name}
        className="rounded-full object-cover"
        style={{ width: dim, height: dim }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center text-white font-semibold"
      style={{ width: dim, height: dim, fontSize: size * 0.4 }}
    >
      {initials(row.full_name)}
    </div>
  )
}

interface LeaderboardClientProps {
  data: LeaderboardData
}

export function LeaderboardClient({ data }: LeaderboardClientProps) {
  const { board, isRealData } = data
  const podium = board.slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Leaderboard</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">XP-based rankings across all students</p>
      </motion.div>

      {!isRealData || board.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <p className="text-[15px] font-medium text-[var(--text-primary)]">No rankings yet</p>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xs">
              Earn XP by completing tasks, diagnostics and challenges to climb the leaderboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 podium */}
          {podium.length === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
              className="flex items-end justify-center gap-4 pt-4 pb-6"
            >
              {[podium[1], podium[0], podium[2]].map((p, i) => {
                const heights = ['h-20', 'h-28', 'h-16']
                const orders = [2, 1, 3]
                return (
                  <div key={p.id} className="flex flex-col items-center gap-2" style={{ order: orders[i] }}>
                    <div className={p.isMe ? 'ring-2 ring-[var(--accent-blue)] ring-offset-2 rounded-full' : ''}>
                      <Avatar row={p} size={40} />
                    </div>
                    <div className="text-[12px] font-medium text-[var(--text-primary)] text-center">{p.full_name.split(' ')[0]}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{p.total_xp.toLocaleString()} XP</div>
                    <div
                      className={`w-16 ${heights[i]} rounded-t-[8px] flex items-center justify-center`}
                      style={{ background: i === 1 ? 'linear-gradient(180deg,#FFD700,#FFA500)' : i === 0 ? 'linear-gradient(180deg,#C0C0C0,#A8A8A8)' : 'linear-gradient(180deg,#CD7F32,#A0522D)' }}
                    >
                      <span className="text-white font-bold text-[16px]">{p.rank}</span>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* Board */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-2">
                <div className="space-y-1">
                  {board.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-[var(--radius-lg)] transition-colors ${
                        p.isMe ? 'bg-blue-50 dark:bg-blue-950/30 border border-[var(--accent-blue)]/30' : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <div className="w-7 flex items-center justify-center shrink-0">
                        {RANK_ICONS[p.rank] ?? (
                          <span className="text-[14px] font-bold text-[var(--text-secondary)]">#{p.rank}</span>
                        )}
                      </div>
                      <div className="shrink-0">
                        <Avatar row={p} size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">{p.full_name}</span>
                          {p.isMe && <Badge variant="blue">You</Badge>}
                        </div>
                        <span className="text-[12px] text-[var(--text-secondary)]">Level {p.level}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-bold text-[var(--text-primary)]">{p.total_xp.toLocaleString()}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">XP</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}
