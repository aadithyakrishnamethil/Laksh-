'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, ChevronLeft, Check, Calendar, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GoalAnalysis } from '@/types'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'
import { saveOnboarding } from '@/lib/actions/onboarding'

const CBSE_SUBJECT_OPTS = CBSE_SUBJECTS.map((s) => ({ id: s.id, name: s.name, icon: s.icon }))

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [fullName, setFullName] = useState('')
  const [examDate, setExamDate] = useState('2027-03-15')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['phy', 'chem', 'math'])
  const [targetPct, setTargetPct] = useState(90)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    )
  }

  async function analyzeGoal() {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPct,
          examDate,
          subjects: selectedSubjects.map((id) => ({
            id,
            name: CBSE_SUBJECTS.find((s) => s.id === id)?.name ?? id,
            currentMastery: 50,
          })),
        }),
      })
      const data = await res.json()
      setAnalysis(data)
    } catch {
      // Fall back to a basic analysis
      setAnalysis({
        subjectBreakdowns: selectedSubjects.map((id) => ({
          subjectId: id,
          targetPct,
          requiredEffortHrs: Math.round((targetPct - 50) / 10) * 4,
          feasibility: targetPct < 85 ? 'feasible' : targetPct < 92 ? 'stretch' : 'unlikely',
          rationale: `Requires focused daily study to achieve ${targetPct}%.`,
        })),
        overallFeasibility: targetPct < 85 ? 'feasible' : 'stretch',
        totalWeeklyHrs: Math.round(selectedSubjects.length * ((targetPct - 50) / 10)),
        summary: `To achieve ${targetPct}%, you need approximately ${Math.round(selectedSubjects.length * ((targetPct - 50) / 10))} hours/week across your chosen subjects.`,
      })
    } finally {
      setAnalyzing(false)
    }
  }

  async function finishOnboarding() {
    if (!analysis) return
    setSaving(true)
    setSaveError('')
    try {
      // Both success and the unauthenticated fallback resolve without throwing;
      // only real errors (DB constraints, network) reach the catch below.
      await saveOnboarding({
        fullName,
        examDate,
        targetPct,
        subjectGoals: analysis.subjectBreakdowns.map((sb) => ({
          subjectId: sb.subjectId,
          targetPct: sb.targetPct,
          requiredEffortHrs: sb.requiredEffortHrs,
          feasibility: sb.feasibility,
          rationale: sb.rationale,
        })),
      })
      router.push('/dashboard')
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Something went wrong saving your goals. Please try again.'
      )
      setSaving(false)
    }
  }

  const weeksRemaining = Math.max(1, Math.floor((new Date(examDate).getTime() - Date.now()) / (7 * 86400000)))

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[16px] font-bold text-[var(--text-primary)]">Laksh</span>
        </div>
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-300 ${
                step === s
                  ? 'w-8 h-8 bg-[var(--accent-blue)] text-white'
                  : step > s
                  ? 'w-8 h-8 bg-[var(--accent-green)] text-white'
                  : 'w-8 h-8 bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-md"
            >
              <div className="text-[40px] mb-4">👋</div>
              <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
                Let&apos;s get you set up
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">
                Step 1 of 3 — Tell us about yourself
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-2">Your name</label>
                  <Input
                    placeholder="e.g. Anya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    CBSE Board Exam Date
                  </label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                  {weeksRemaining > 0 && (
                    <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                      {weeksRemaining} weeks remaining
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-8"
                onClick={() => setStep(2)}
                disabled={!fullName}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-md"
            >
              <div className="text-[40px] mb-4">📚</div>
              <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
                Your subjects
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">
                Step 2 of 3 — Select your CBSE Class 12 subjects
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {CBSE_SUBJECT_OPTS.map((sub) => {
                  const selected = selectedSubjects.includes(sub.id)
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center gap-3 p-4 rounded-[var(--radius-xl)] text-left transition-all duration-200 ${
                        selected
                          ? 'bg-blue-50 border-2 border-[var(--accent-blue)] dark:bg-blue-950/30'
                          : 'bg-[var(--bg-subtle)] border-2 border-transparent hover:border-[var(--border-subtle)]'
                      }`}
                    >
                      <span className="text-[22px]">{sub.icon}</span>
                      <div>
                        <div className={`text-[14px] font-medium ${selected ? 'text-[var(--accent-blue)]' : 'text-[var(--text-primary)]'}`}>
                          {sub.name}
                        </div>
                        {selected && (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-blue)] flex items-center justify-center mt-1">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mb-6 text-center">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={() => setStep(3)} className="flex-1">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-lg"
            >
              <div className="text-[40px] mb-4">🎯</div>
              <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
                Set your target score
              </h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-8">
                Step 3 of 3 — AI will break this down into per-subject goals
              </p>

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
                    <div className="flex justify-between text-[12px] text-[var(--text-secondary)]">
                      <span>60%</span>
                      <span>75%</span>
                      <span>85%</span>
                      <span>95%</span>
                      <span>100%</span>
                    </div>
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

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" size="lg" onClick={() => setStep(2)} className="flex-1">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={analyzeGoal}
                      loading={analyzing}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analyse with AI
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--accent-blue)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">AI Analysis</p>
                        <p className="text-[13px] text-[var(--text-secondary)]">{analysis.summary}</p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    {analysis.subjectBreakdowns.map((sb) => {
                      const subName = CBSE_SUBJECTS.find((s) => s.id === sb.subjectId)?.name ?? sb.subjectId
                      return (
                        <div key={sb.subjectId} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[14px] font-medium text-[var(--text-primary)]">{subName}</span>
                              <Badge variant={sb.feasibility === 'feasible' ? 'green' : sb.feasibility === 'stretch' ? 'orange' : 'red'}>
                                {sb.feasibility}
                              </Badge>
                            </div>
                            <p className="text-[12px] text-[var(--text-secondary)] truncate">{sb.rationale}</p>
                          </div>
                          <div className="text-right ml-3 shrink-0">
                            <div className="text-[16px] font-bold text-[var(--accent-blue)]">{sb.targetPct}%</div>
                            <div className="text-[11px] text-[var(--text-secondary)]">{sb.requiredEffortHrs}h total</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[13px] p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                    <span className="text-[var(--text-secondary)]">Weekly effort needed</span>
                    <span className="font-semibold text-[var(--text-primary)]">{analysis.totalWeeklyHrs} hours/week</span>
                  </div>

                  {saveError && (
                    <p className="text-[13px] text-[var(--accent-red)] bg-red-50 dark:bg-red-950/30 rounded-[var(--radius-md)] px-3 py-2">
                      {saveError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" size="md" onClick={() => setAnalysis(null)} className="flex-1">
                      Adjust Target
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={finishOnboarding}
                      loading={saving}
                      className="flex-1"
                    >
                      Start Learning! 🚀
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
