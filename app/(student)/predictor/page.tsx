'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { SEED_PREDICTIONS, SEED_SUBJECT_GOALS, SEED_GOAL } from '@/lib/db/seed-data'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

const LATEST = SEED_PREDICTIONS[SEED_PREDICTIONS.length - 1]

const TREND_DATA = SEED_PREDICTIONS.map((p, i) => ({
  week: `W${i + 1}`,
  score: Math.round(p.predicted_overall_pct * 10) / 10,
}))

const RISK_CONFIG = {
  'on-track': { label: 'On Track', variant: 'green' as const, icon: CheckCircle2 },
  'at-risk':  { label: 'At Risk',  variant: 'orange' as const, icon: AlertTriangle },
  'critical': { label: 'Critical', variant: 'red' as const,   icon: AlertTriangle },
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] px-3 py-2 shadow-lg">
      <p className="text-[12px] text-[var(--text-secondary)] mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{payload[0].value}%</p>
    </div>
  )
}

export default function PredictorPage() {
  const [refreshing, setRefreshing] = useState(false)

  const risk = RISK_CONFIG[LATEST.risk_level]
  const RiskIcon = risk.icon
  const targetGap = SEED_GOAL.target_overall_pct - LATEST.predicted_overall_pct
  const onTrack = targetGap <= 0

  async function refresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setRefreshing(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Score Predictor</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">AI-powered CBSE board exam forecast</p>
        </div>
        <Button variant="secondary" onClick={refresh} loading={refreshing}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </motion.div>

      {/* Hero metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="flex flex-col items-center justify-center py-8">
          <ProgressRing value={Math.round(LATEST.predicted_overall_pct)} size={140} status={LATEST.risk_level}>
            <div className="text-center">
              <div className="text-[28px] font-bold">{Math.round(LATEST.predicted_overall_pct)}%</div>
              <div className="text-[11px] text-[var(--text-secondary)]">predicted</div>
            </div>
          </ProgressRing>
          <div className="mt-4 text-center">
            <Badge variant={risk.variant}>
              <RiskIcon className="w-3 h-3" />
              {risk.label}
            </Badge>
            <p className="text-[12px] text-[var(--text-secondary)] mt-2">
              Confidence: <b className="text-[var(--text-primary)]">{LATEST.confidence_pct}%</b>
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-center gap-4 py-6">
          <div>
            <p className="text-[13px] text-[var(--text-secondary)] mb-1">Target Goal</p>
            <div className="flex items-end gap-2">
              <span className="text-[36px] font-bold text-[var(--text-primary)]">{SEED_GOAL.target_overall_pct}%</span>
              <span className="text-[14px] text-[var(--text-secondary)] pb-2">overall</span>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[var(--text-secondary)] mb-1">Gap to Close</p>
            <div className="flex items-center gap-2">
              <span className={`text-[28px] font-bold ${onTrack ? 'text-[var(--accent-green)]' : 'text-[var(--accent-orange)]'}`}>
                {onTrack ? '0' : `${targetGap.toFixed(1)}`}%
              </span>
              {onTrack ? (
                <Badge variant="green">On target</Badge>
              ) : (
                <Badge variant="orange">{targetGap.toFixed(1)}% to go</Badge>
              )}
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (LATEST.predicted_overall_pct / SEED_GOAL.target_overall_pct) * 100)}%`,
                background: onTrack ? '#34C759' : 'linear-gradient(90deg,#2A7AFE,#53C8FF)',
              }}
            />
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />
              <CardTitle>Score Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2A7AFE" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2A7AFE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#2A7AFE" strokeWidth={2.5} fill="url(#trendGrad)" dot={false} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[12px] text-[var(--text-secondary)] mt-2">
              +{(LATEST.predicted_overall_pct - SEED_PREDICTIONS[0].predicted_overall_pct).toFixed(1)}% over 10 weeks
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-subject breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
            <p className="text-[13px] text-[var(--text-secondary)]">Predicted vs target per subject</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {Object.entries(LATEST.per_subject).map(([subId, data]) => {
                const sub = CBSE_SUBJECTS.find((s) => s.id === subId)
                const sg = SEED_SUBJECT_GOALS.find((s) => s.subject_id === subId)
                const gap = data.target - data.predicted
                const pct = Math.min(100, (data.predicted / data.target) * 100)
                const statusColor = gap <= 0 ? '#34C759' : gap <= 5 ? '#FF9F0A' : '#FF3B30'
                return (
                  <div key={subId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px]">{sub?.icon}</span>
                        <span className="text-[14px] font-medium text-[var(--text-primary)]">{sub?.name}</span>
                        {sg && (
                          <Badge variant={sg.ai_feasibility === 'feasible' ? 'green' : sg.ai_feasibility === 'stretch' ? 'orange' : 'red'}>
                            {sg.ai_feasibility}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[16px] font-bold" style={{ color: statusColor }}>{Math.round(data.predicted)}%</span>
                        <span className="text-[13px] text-[var(--text-secondary)] ml-2">/ {data.target}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: sub?.color ?? '#2A7AFE' }}
                      />
                    </div>
                    {gap > 0 && (
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {gap.toFixed(1)}% gap · ~{sg?.required_effort_hrs ?? 20}h effort remaining
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prediction history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prediction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left py-2 pr-4 font-medium text-[var(--text-secondary)]">Date</th>
                    <th className="text-right py-2 px-4 font-medium text-[var(--text-secondary)]">Predicted</th>
                    <th className="text-right py-2 px-4 font-medium text-[var(--text-secondary)]">Confidence</th>
                    <th className="text-right py-2 font-medium text-[var(--text-secondary)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...SEED_PREDICTIONS].reverse().map((p) => {
                    const r = RISK_CONFIG[p.risk_level]
                    const Ic = r.icon
                    return (
                      <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-0">
                        <td className="py-2.5 pr-4 text-[var(--text-secondary)]">
                          {new Date(p.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-[var(--text-primary)]">
                          {Math.round(p.predicted_overall_pct)}%
                        </td>
                        <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                          {p.confidence_pct}%
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge variant={r.variant}>
                            <Ic className="w-3 h-3" />
                            {r.label}
                          </Badge>
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
    </div>
  )
}
