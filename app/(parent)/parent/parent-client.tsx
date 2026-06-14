'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, Flame, Clock, AlertCircle, CheckCircle2,
  Heart, BookOpen, Calendar,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { ScoreLineChart } from '@/components/charts/score-line-chart'
import { AssistantPanel } from '@/components/layout/assistant-panel'
import {
  SEED_STUDENT,
  SEED_GOAL,
  SEED_STREAK,
  SEED_PREDICTIONS,
  SEED_BURNOUT,
  SEED_PARENT_WEEKLY,
  SEED_PARENT_HIGHLIGHTS,
  SEED_SUBJECT_STATS,
} from '@/lib/db/seed-data'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
}
const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const ASSISTANT_CONTEXT = {
  profile: { full_name: SEED_STUDENT.full_name },
  goal: { target_overall_pct: SEED_GOAL.target_overall_pct },
}

const SUGGESTIONS = [
  'How is my child doing overall?',
  'Which subjects need the most support?',
  'Are there any signs of stress or burnout?',
  'How can I help at home this week?',
]

export function ParentClient() {
  const childFirst = SEED_STUDENT.full_name.split(' ')[0]
  const latest = SEED_PREDICTIONS[SEED_PREDICTIONS.length - 1]
  const prev = SEED_PREDICTIONS[SEED_PREDICTIONS.length - 2]
  const scoreDelta = Math.round(latest.predicted_overall_pct - prev.predicted_overall_pct)
  const burnoutLevel = SEED_BURNOUT.level as string
  const weeklyMinutes = SEED_PARENT_WEEKLY.reduce((s, d) => s + d.minutes, 0)
  const weeklyHours = (weeklyMinutes / 60).toFixed(1)
  const activeDays = SEED_PARENT_WEEKLY.filter((d) => d.minutes > 0).length

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">
            {childFirst}&apos;s Progress
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            CBSE Class 12 · Target {SEED_GOAL.target_overall_pct}% · Exam {SEED_STUDENT.target_exam_date}
          </p>
        </div>
        {burnoutLevel !== 'ok' && (
          <Badge variant={burnoutLevel === 'high' ? 'red' : 'orange'} className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {burnoutLevel === 'high' ? 'Needs rest' : 'Mild fatigue'}
          </Badge>
        )}
      </motion.div>

      {/* Top metrics */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <Card>
            <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">Predicted Score</p>
            <div className="flex items-end gap-2">
              <span className="text-[32px] font-bold text-[var(--text-primary)] leading-none">{Math.round(latest.predicted_overall_pct)}%</span>
              <span className={`text-[13px] font-medium mb-1 flex items-center gap-0.5 ${scoreDelta >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta}%
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">{latest.confidence_pct}% confidence</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">Study Streak</p>
                <div className="flex items-end gap-1">
                  <span className="text-[32px] font-bold text-[var(--text-primary)] leading-none">{SEED_STREAK.current}</span>
                  <span className="text-[13px] text-[var(--text-secondary)] mb-1">days</span>
                </div>
              </div>
              <Flame className="w-7 h-7 text-[var(--accent-orange)]" />
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">Best: {SEED_STREAK.longest} days</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">This Week</p>
                <div className="flex items-end gap-1">
                  <span className="text-[32px] font-bold text-[var(--text-primary)] leading-none">{weeklyHours}</span>
                  <span className="text-[13px] text-[var(--text-secondary)] mb-1">hrs</span>
                </div>
              </div>
              <Clock className="w-7 h-7 text-[var(--accent-blue)]" />
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">Active {activeDays}/7 days</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="flex items-center gap-4">
            <ProgressRing
              value={latest.predicted_overall_pct}
              size={72}
              strokeWidth={6}
              status={latest.risk_level as 'on-track' | 'at-risk' | 'critical'}
            >
              <span className="text-[14px] font-bold">{Math.round(latest.predicted_overall_pct)}%</span>
            </ProgressRing>
            <div>
              <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">Status</p>
              <Badge variant={latest.risk_level === 'on-track' ? 'green' : latest.risk_level === 'at-risk' ? 'orange' : 'red'}>
                {latest.risk_level === 'on-track' ? '✓ On track' : latest.risk_level === 'at-risk' ? '⚠ At risk' : '🔴 Critical'}
              </Badge>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts + highlights */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-blue)]" />
                Daily Study Time
              </CardTitle>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">{weeklyHours} hrs this week</span>
            </CardHeader>
            <CardContent>
              <ScoreLineChart
                data={SEED_PARENT_WEEKLY}
                xKey="day"
                yKey="hours"
                color="#2A7AFE"
                showAxes
                height={180}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Heart className="w-4 h-4 text-[var(--accent-red)]" />
                Weekly Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SEED_PARENT_HIGHLIGHTS.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {h.tone === 'positive' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                    )}
                    <p className="text-[13px] text-[var(--text-primary)] leading-snug">{h.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Subject mastery + score trend */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent-green)]" />
                Subject Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SEED_SUBJECT_STATS.map((s) => (
                  <div key={s.subject} className="flex items-center gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)] w-20 shrink-0">{s.subject}</span>
                    <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.mastery}%`, background: s.color }} />
                    </div>
                    <span className="text-[13px] font-medium text-[var(--text-primary)] w-10 text-right">{s.mastery}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />
                Predicted Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreLineChart
                data={SEED_PREDICTIONS.map((p, i) => ({ week: `W${i + 1}`, score: Math.round(p.predicted_overall_pct) }))}
                xKey="week"
                yKey="score"
                showAxes
                height={180}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* AI Parent Assistant */}
      <motion.div variants={fadeUp}>
        <AssistantPanel
          endpoint="/api/ai/parent"
          context={ASSISTANT_CONTEXT}
          title="AI Parent Assistant"
          subtitle={`Insights about ${childFirst}'s preparation`}
          greeting={`Hello! I'm here to help you support ${childFirst}'s board exam preparation. Ask me anything about their progress, well-being, or how you can help at home.`}
          suggestions={SUGGESTIONS}
        />
      </motion.div>
    </motion.div>
  )
}
