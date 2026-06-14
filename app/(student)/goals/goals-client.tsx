'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Target, TrendingUp, Clock, ChevronRight, Edit3, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import type { GoalAnalysis } from '@/types'
import { SEED_GOAL, SEED_SUBJECT_GOALS, SEED_SUBJECT_STATS } from '@/lib/db/seed-data'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export function GoalsClient() {
  const [showSetter, setShowSetter] = useState(false)
  const [targetPct, setTargetPct] = useState(92)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null)

  async function analyzeGoal() {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPct,
          examDate: '2025-03-15',
          subjects: CBSE_SUBJECTS.slice(0, 5).map((s) => ({
            id: s.id,
            name: s.name,
            currentMastery: SEED_SUBJECT_STATS.find((ss) => ss.subject.toLowerCase().includes(s.name.toLowerCase().slice(0, 3)))?.mastery ?? 65,
          })),
        }),
      })
      const data: GoalAnalysis = await res.json()
      setAnalysis(data)
    } catch {
      setAnalysis(null)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">My Goals</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">Your CBSE Class 12 board exam targets</p>
        </div>
        <Button variant="primary" onClick={() => { setShowSetter(true); setAnalysis(null) }}>
          <Sparkles className="w-4 h-4" />
          Update Goal
        </Button>
      </motion.div>

      {/* Active goal */}
      <motion.div {...fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent-blue)]" />
              <CardTitle>Active Goal</CardTitle>
            </div>
            <Badge variant="green">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <ProgressRing value={SEED_GOAL.target_overall_pct} size={100} status="on-track">
                <div className="text-center">
                  <div className="text-[18px] font-bold">{SEED_GOAL.target_overall_pct}%</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">target</div>
                </div>
              </ProgressRing>
              <div>
                <h3 className="text-[20px] font-semibold text-[var(--text-primary)] mb-1">
                  CBSE Class 12 — {SEED_GOAL.target_overall_pct}% Overall
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)]">
                  Set on {new Date(SEED_GOAL.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Subject goals grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SEED_SUBJECT_GOALS.map((sg) => {
                const sub = CBSE_SUBJECTS.find((s) => s.id === sg.subject_id)
                const current = SEED_SUBJECT_STATS.find((s) => s.subject.toLowerCase().includes(sub?.name.toLowerCase().slice(0, 3) ?? ''))
                const currentMastery = current?.mastery ?? 65
                return (
                  <div
                    key={sg.id}
                    className="p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-xl)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px]">{sub?.icon}</span>
                        <span className="text-[14px] font-medium text-[var(--text-primary)]">{sub?.name}</span>
                      </div>
                      <Badge
                        variant={sg.ai_feasibility === 'feasible' ? 'green' : sg.ai_feasibility === 'stretch' ? 'orange' : 'red'}
                      >
                        {sg.ai_feasibility}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${currentMastery}%`, background: sub?.color ?? '#2A7AFE' }}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-[var(--text-primary)] w-8 text-right">{currentMastery}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                      <span>Target: <b className="text-[var(--text-primary)]">{sg.target_pct}%</b></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sg.required_effort_hrs}h
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 line-clamp-2">{sg.ai_rationale}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Goal Setter modal */}
      <AnimatePresence>
        {showSetter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => { if (!analyzing) { setShowSetter(false); setAnalysis(null) } }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--accent-blue)]" />
                    <CardTitle>AI Goal Setter</CardTitle>
                  </div>
                  <button
                    onClick={() => { setShowSetter(false); setAnalysis(null) }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-[20px]"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </CardHeader>
                <CardContent>
                  {!analysis ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-3">
                          Target overall percentage
                        </label>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[48px] font-bold text-[var(--accent-blue)] w-24 text-right">{targetPct}%</span>
                          <input
                            type="range"
                            min={60}
                            max={100}
                            value={targetPct}
                            onChange={(e) => setTargetPct(Number(e.target.value))}
                            className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full appearance-none cursor-pointer accent-[var(--accent-blue)]"
                          />
                        </div>
                        <div className="flex gap-2">
                          {[75, 80, 85, 90, 95].map((v) => (
                            <button
                              key={v}
                              onClick={() => setTargetPct(v)}
                              className={`flex-1 py-2 rounded-[var(--radius-pill)] text-[13px] font-medium transition-all ${
                                targetPct === v
                                  ? 'bg-[var(--accent-blue)] text-white'
                                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                              }`}
                            >
                              {v}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={analyzeGoal}
                        loading={analyzing}
                      >
                        <Sparkles className="w-4 h-4" />
                        Analyse with AI
                      </Button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-[var(--radius-lg)] border border-blue-100 dark:border-blue-900">
                        <p className="text-[13px] font-medium text-[var(--accent-blue)] mb-1">
                          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                          AI Analysis
                        </p>
                        <p className="text-[13px] text-[var(--text-secondary)]">{analysis.summary}</p>
                      </div>

                      <div className="space-y-2">
                        {analysis.subjectBreakdowns.map((sb) => {
                          const sub = CBSE_SUBJECTS.find((s) => s.id === sb.subjectId)
                          return (
                            <div key={sb.subjectId} className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                              <span className="text-[20px]">{sub?.icon ?? '📚'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[14px] font-medium text-[var(--text-primary)]">{sub?.name ?? sb.subjectId}</span>
                                  <Badge variant={sb.feasibility === 'feasible' ? 'green' : sb.feasibility === 'stretch' ? 'orange' : 'red'}>
                                    {sb.feasibility}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{sb.rationale}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[16px] font-bold" style={{ color: sub?.color ?? '#2A7AFE' }}>{sb.targetPct}%</div>
                                <div className="text-[11px] text-[var(--text-secondary)]">{sb.requiredEffortHrs}h</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                          <Clock className="w-4 h-4" />
                          Weekly effort needed
                        </div>
                        <span className="text-[14px] font-bold text-[var(--text-primary)]">{analysis.totalWeeklyHrs} hrs/week</span>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setAnalysis(null)} className="flex-1">
                          Adjust
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => { setShowSetter(false); setAnalysis(null) }}
                          className="flex-1 gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Save Goal
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
