'use client'

import { motion } from 'framer-motion'
import {
  Users, AlertTriangle, TrendingUp, Target, BookX, Flame,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubjectRadar } from '@/components/charts/subject-radar'
import { ScoreLineChart } from '@/components/charts/score-line-chart'
import { AssistantPanel } from '@/components/layout/assistant-panel'
import {
  SEED_COHORT,
  SEED_COHORT_RADAR,
  SEED_COHORT_TREND,
  SEED_COHORT_STUDENTS,
} from '@/lib/db/seed-data'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
}
const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

const ASSISTANT_CONTEXT = {
  classId: SEED_COHORT.classId,
  className: SEED_COHORT.className,
  studentCount: SEED_COHORT.studentCount,
  atRiskCount: SEED_COHORT.atRiskCount,
  avgPredictedScore: SEED_COHORT.avgPredictedScore,
  weakestChapters: SEED_COHORT.weakestChapters.map((c) => ({ chapterId: c.name, avgMastery: c.avgMastery })),
}

const SUGGESTIONS = [
  'Which students need the most attention?',
  'What should I focus my next class on?',
  'Summarise the cohort\'s weakest areas',
  'Who is at risk of missing their target?',
]

const RISK_BADGE = {
  'on-track': { variant: 'green' as const, label: 'On track' },
  'at-risk': { variant: 'orange' as const, label: 'At risk' },
  critical: { variant: 'red' as const, label: 'Critical' },
}

export function TeacherClient() {
  const sorted = [...SEED_COHORT_STUDENTS].sort((a, b) => a.predicted - b.predicted)

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
            {SEED_COHORT.className}
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            {SEED_COHORT.studentCount} students · Cohort average {SEED_COHORT.avgPredictedScore}% predicted
          </p>
        </div>
        {SEED_COHORT.atRiskCount > 0 && (
          <Badge variant="red" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {SEED_COHORT.atRiskCount} at risk
          </Badge>
        )}
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: SEED_COHORT.studentCount, icon: Users, color: 'var(--accent-blue)' },
          { label: 'Avg Predicted', value: `${SEED_COHORT.avgPredictedScore}%`, icon: TrendingUp, color: 'var(--accent-green)' },
          { label: 'On Track', value: SEED_COHORT.onTrackCount, icon: Target, color: 'var(--accent-green)' },
          { label: 'At Risk', value: SEED_COHORT.atRiskCount, icon: AlertTriangle, color: 'var(--accent-red)' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">{stat.label}</p>
                  <span className="text-[32px] font-bold text-[var(--text-primary)] leading-none">{stat.value}</span>
                </div>
                <stat.icon className="w-7 h-7 shrink-0" style={{ color: stat.color }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Radar + trend + weakest chapters */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Cohort Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectRadar data={SEED_COHORT_RADAR} height={200} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />
                Avg Score Trend
              </CardTitle>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">{SEED_COHORT.avgPredictedScore}%</span>
            </CardHeader>
            <CardContent>
              <ScoreLineChart
                data={SEED_COHORT_TREND}
                xKey="week"
                yKey="avg"
                showAxes
                height={200}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <BookX className="w-4 h-4 text-[var(--accent-red)]" />
                Weakest Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SEED_COHORT.weakestChapters.map((c) => (
                  <div key={c.chapterId} className="flex items-center gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)] flex-1 min-w-0 truncate">{c.name}</span>
                    <div className="w-20 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full bg-[var(--accent-red)] transition-all duration-700"
                        style={{ width: `${c.avgMastery}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-medium text-[var(--text-primary)] w-10 text-right">{c.avgMastery}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Student table */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent-blue)]" />
              Students
            </CardTitle>
            <span className="text-[12px] text-[var(--text-secondary)]">Sorted by predicted score</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--border-subtle)]">
                    <th className="font-medium py-2 pr-4">Student</th>
                    <th className="font-medium py-2 px-4">Predicted</th>
                    <th className="font-medium py-2 px-4">Target</th>
                    <th className="font-medium py-2 px-4">Streak</th>
                    <th className="font-medium py-2 px-4">Weak Subject</th>
                    <th className="font-medium py-2 px-4">Last Active</th>
                    <th className="font-medium py-2 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => {
                    const badge = RISK_BADGE[s.risk]
                    return (
                      <tr key={s.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-[14px] font-medium text-[var(--text-primary)]">{s.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[14px] font-semibold ${s.predicted >= s.target ? 'text-[var(--accent-green)]' : s.risk === 'critical' ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}>
                            {s.predicted}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[14px] text-[var(--text-secondary)]">{s.target}%</td>
                        <td className="py-3 px-4">
                          <span className="text-[14px] text-[var(--text-primary)] inline-flex items-center gap-1">
                            <Flame className={`w-3.5 h-3.5 ${s.streak > 0 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-tertiary)]'}`} />
                            {s.streak}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[14px] text-[var(--text-secondary)]">{s.weakSubject}</td>
                        <td className="py-3 px-4 text-[13px] text-[var(--text-secondary)]">{s.lastActive}</td>
                        <td className="py-3 pl-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Teacher Assistant */}
      <motion.div variants={fadeUp}>
        <AssistantPanel
          endpoint="/api/ai/teacher"
          context={ASSISTANT_CONTEXT}
          title="AI Teacher Assistant"
          subtitle={`Cohort insights for ${SEED_COHORT.className}`}
          greeting={`Hi! I can help you analyse ${SEED_COHORT.className}. Ask me about at-risk students, weak topics across the cohort, or where to focus your next session.`}
          suggestions={SUGGESTIONS}
        />
      </motion.div>
    </motion.div>
  )
}
