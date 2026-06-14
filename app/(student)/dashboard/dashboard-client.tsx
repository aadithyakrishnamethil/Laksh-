'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Target, TrendingUp, Flame, Zap, CheckCircle2, Circle,
  AlertCircle, ArrowRight, Calendar, BarChart3, BookOpen, Sparkles,
  Clock, Activity
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { ScoreLineChart } from '@/components/charts/score-line-chart'
import { SubjectRadar } from '@/components/charts/subject-radar'
import type { DashboardData } from '@/lib/db/queries'
import { format } from 'date-fns'

interface DashboardClientProps {
  data: DashboardData
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
}

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

export function DashboardClient({ data }: DashboardClientProps) {
  const today = new Date()
  const {
    student, goal, streak, xp, level, predictions,
    subjectStats, weeklyChart, planTasks, burnout, recentActivity,
  } = data

  const latestPrediction = predictions[predictions.length - 1]
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayTasks = planTasks.filter((t) => t.date === todayStr)
  // Tasks actually shown in the card (fall back to the next 3 planned tasks)
  const shownTasks = (todayTasks.length > 0 ? todayTasks : planTasks.slice(0, 3)).slice(0, 3)
  const shownDone = shownTasks.filter((t) => t.status === 'done').length
  const xpToNextLevel = level * 500 - xp
  const levelProgress = ((xp % 500) / 500) * 100
  const burnoutLevel = burnout.level

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
            Welcome back, {student.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            {format(today, 'EEEE, MMMM d')} · {streak.current} day streak 🔥
          </p>
        </div>
        <div className="flex items-center gap-3">
          {burnoutLevel !== 'ok' && (
            <Badge variant={burnoutLevel === 'high' ? 'red' : 'orange'} className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {burnoutLevel === 'high' ? 'Rest needed' : 'Mild fatigue'}
            </Badge>
          )}
          <Link href="/planner">
            <Button variant="primary" size="sm">
              <Calendar className="w-4 h-4" />
              Today&apos;s Plan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Top row: Goal card + Score predictor + Streak */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active goal */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--accent-blue)]" />
                <CardTitle>Target: {goal.target_overall_pct}% in CBSE Class 12</CardTitle>
              </div>
              <Link href="/predictor" className="text-[13px] font-medium text-[var(--accent-blue)] hover:opacity-70 transition-opacity flex items-center gap-1">
                View Predictor <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <ProgressRing
                  value={latestPrediction.predicted_overall_pct}
                  size={88}
                  strokeWidth={7}
                  status={latestPrediction.risk_level as 'on-track' | 'at-risk' | 'critical'}
                >
                  <div className="text-center">
                    <div className="text-[16px] font-bold">{Math.round(latestPrediction.predicted_overall_pct)}%</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">predicted</div>
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={latestPrediction.risk_level === 'on-track' ? 'green' : latestPrediction.risk_level === 'at-risk' ? 'orange' : 'red'}>
                      {latestPrediction.risk_level === 'on-track' ? '✓ On track' : latestPrediction.risk_level === 'at-risk' ? '⚠ At risk' : '🔴 Critical'}
                    </Badge>
                    <span className="text-[12px] text-[var(--text-secondary)]">{latestPrediction.confidence_pct}% confidence</span>
                  </div>
                  <div className="space-y-1.5">
                    {subjectStats.slice(0, 3).map((s) => (
                      <div key={s.subject} className="flex items-center gap-2">
                        <span className="text-[12px] text-[var(--text-secondary)] w-16 shrink-0">{s.subject}</span>
                        <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${s.mastery}%`, background: s.color }}
                          />
                        </div>
                        <span className="text-[12px] font-medium text-[var(--text-primary)] w-8 text-right">{s.mastery}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prediction trend mini chart */}
              <div>
                <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wide mb-2">Score Trend</p>
                <ScoreLineChart
                  data={predictions.map((p, i) => ({ week: `W${i + 1}`, score: Math.round(p.predicted_overall_pct) }))}
                  xKey="week"
                  yKey="score"
                  height={60}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column: Streak + XP */}
        <motion.div variants={stagger} className="flex flex-col gap-4">
          {/* Streak */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">Study Streak</p>
                  <div className="flex items-end gap-1">
                    <span className="text-[36px] font-bold text-[var(--text-primary)] leading-none">{streak.current}</span>
                    <span className="text-[14px] text-[var(--text-secondary)] mb-1">days</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">Best: {streak.longest} days</p>
                </div>
                <div className="text-[40px]">🔥</div>
              </div>
            </Card>
          </motion.div>

          {/* XP / Level */}
          <motion.div variants={fadeUp}>
            <Card>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[12px] text-[var(--text-secondary)] uppercase tracking-wide mb-1">Level {level}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-[28px] font-bold text-[var(--text-primary)] leading-none">{xp.toLocaleString()}</span>
                    <span className="text-[12px] text-[var(--text-secondary)] mb-1">XP</span>
                  </div>
                </div>
                <Zap className="w-8 h-8 text-[var(--accent-orange)]" />
              </div>
              <div className="w-full h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">{xpToNextLevel} XP to Level {level + 1}</p>
            </Card>
          </motion.div>

          {/* Today's tasks */}
          <motion.div variants={fadeUp} className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-[15px]">Today&apos;s Tasks</CardTitle>
                <span className="text-[12px] text-[var(--text-secondary)]">{shownDone}/{shownTasks.length}</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shownTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--border-subtle)] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] truncate ${task.status === 'done' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                          {task.chapter_id.replaceAll('-', ' ').toUpperCase()}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{task.est_minutes} min · {task.type}</p>
                      </div>
                    </div>
                  ))}
                  {shownTasks.length === 0 && (
                    <p className="text-[13px] text-[var(--text-secondary)] text-center py-2">
                      Tasks load from your plan
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Weekly overview */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-blue)]" />
                Goal Hours Logged
              </CardTitle>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                {weeklyChart.reduce((s, d) => s + d.goalHrs, 0).toFixed(1)} hrs
              </span>
            </CardHeader>
            <CardContent>
              <ScoreLineChart
                data={weeklyChart}
                xKey="day"
                yKey="goalHrs"
                color="#2A7AFE"
                showAxes
                height={140}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-green)]" />
                Focus Score
              </CardTitle>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                {Math.round(weeklyChart.reduce((s, d) => s + d.focusScore, 0) / weeklyChart.length)}%
              </span>
            </CardHeader>
            <CardContent>
              <ScoreLineChart
                data={weeklyChart}
                xKey="day"
                yKey="focusScore"
                color="#34C759"
                gradientFrom="#34C759"
                gradientTo="#34C759"
                showAxes
                height={140}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom row: Radar + Recent activity + Quick actions */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subject radar */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Subject Strengths</CardTitle>
              <Link href="/diagnostics" className="text-[12px] text-[var(--accent-blue)] hover:opacity-70 flex items-center gap-1">
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <SubjectRadar data={subjectStats} height={200} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Recent Activity</CardTitle>
              <span className="text-[12px] text-[var(--text-secondary)]">This week</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      item.type === 'achievement' ? 'bg-[var(--accent-orange)]' :
                      item.type === 'test' ? 'bg-[var(--accent-red)]' :
                      item.type === 'flashcard' ? 'bg-purple-400' :
                      'bg-[var(--accent-blue)]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[var(--text-primary)] leading-tight">{item.text}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-[15px]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/coach?action=new" className="block">
                <Button variant="primary" className="w-full justify-start gap-3">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Ask AI Coach
                </Button>
              </Link>
              <Link href="/diagnostics?action=start" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  Take Diagnostic
                </Button>
              </Link>
              <Link href="/revision" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  Start Revision
                </Button>
              </Link>
              <Link href="/practice" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <Target className="w-4 h-4 shrink-0" />
                  Practice Paper
                </Button>
              </Link>
              {burnoutLevel !== 'ok' && (
                <div className={`mt-2 p-3 rounded-[var(--radius-lg)] text-[12px] ${
                  burnoutLevel === 'high' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                }`}>
                  <p className="font-medium mb-1">{burnoutLevel === 'high' ? '🛌 Rest Day Recommended' : '⚠️ Burnout Watch'}</p>
                  <p>{burnout.interventions[0]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
