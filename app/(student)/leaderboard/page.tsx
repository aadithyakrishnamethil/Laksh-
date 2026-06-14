'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEED_XP, SEED_LEVEL, SEED_STUDENT } from '@/lib/db/seed-data'

type Tab = 'class' | 'global'

const CLASS_BOARD = [
  { rank: 1, name: 'Rohan Mehta',    xp: 3120, level: 7, avatar: '👦', isMe: false },
  { rank: 2, name: 'Anya Sharma',   xp: SEED_XP, level: SEED_LEVEL, avatar: '👩', isMe: true },
  { rank: 3, name: 'Priya Nair',    xp: 2100, level: 5, avatar: '👧', isMe: false },
  { rank: 4, name: 'Arjun Singh',   xp: 1890, level: 4, avatar: '🧑', isMe: false },
  { rank: 5, name: 'Meera Iyer',    xp: 1720, level: 4, avatar: '👩', isMe: false },
  { rank: 6, name: 'Kabir Khan',    xp: 1540, level: 3, avatar: '👦', isMe: false },
  { rank: 7, name: 'Divya Reddy',   xp: 1320, level: 3, avatar: '👧', isMe: false },
  { rank: 8, name: 'Aditya Kumar',  xp: 980,  level: 2, avatar: '🧑', isMe: false },
]

const GLOBAL_BOARD = [
  { rank: 1, name: 'Sneha Patel',   xp: 8900, level: 18, avatar: '👩', isMe: false },
  { rank: 2, name: 'Vikram Rajan',  xp: 7600, level: 16, avatar: '👦', isMe: false },
  { rank: 3, name: 'Zara Ahmed',    xp: 6800, level: 14, avatar: '👧', isMe: false },
  { rank: 47, name: 'Anya Sharma',  xp: SEED_XP, level: SEED_LEVEL, avatar: '👩', isMe: true },
]

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Crown className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-slate-400" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('class')
  const board = tab === 'class' ? CLASS_BOARD : GLOBAL_BOARD

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Leaderboard</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">XP-based class and global rankings</p>
      </motion.div>

      {/* Top 3 podium */}
      {tab === 'class' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          className="flex items-end justify-center gap-4 pt-4 pb-6"
        >
          {[CLASS_BOARD[1], CLASS_BOARD[0], CLASS_BOARD[2]].map((p, i) => {
            const heights = ['h-20', 'h-28', 'h-16']
            const orders = [2, 1, 3]
            return (
              <div key={p.rank} className="flex flex-col items-center gap-2" style={{ order: orders[i] }}>
                <div className={`text-[28px] ${p.isMe ? 'ring-2 ring-[var(--accent-blue)] ring-offset-2 rounded-full' : ''}`}>
                  {p.avatar}
                </div>
                <div className="text-[12px] font-medium text-[var(--text-primary)] text-center">{p.name.split(' ')[0]}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{p.xp.toLocaleString()} XP</div>
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

      {/* Tab switcher */}
      <div className="flex items-center bg-[var(--bg-subtle)] rounded-[var(--radius-pill)] p-1 w-fit">
        {(['class', 'global'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all capitalize ${
              tab === t ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {t === 'class' ? 'My Class' : 'Global'}
          </button>
        ))}
      </div>

      {/* Board */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-2">
            <div className="space-y-1">
              {tab === 'global' && board[0].rank > 3 && (
                <div className="text-[12px] text-[var(--text-secondary)] px-3 py-2">Top 3 globally...</div>
              )}
              {board.map((p, i) => (
                <motion.div
                  key={`${p.rank}-${p.name}`}
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
                  <div className="text-[22px] shrink-0">{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">{p.name}</span>
                      {p.isMe && <Badge variant="blue">You</Badge>}
                    </div>
                    <span className="text-[12px] text-[var(--text-secondary)]">Level {p.level}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-bold text-[var(--text-primary)]">{p.xp.toLocaleString()}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <p className="text-[12px] text-[var(--text-secondary)] text-center">
        Leaderboard updates in real-time via Supabase Realtime
      </p>
    </div>
  )
}
