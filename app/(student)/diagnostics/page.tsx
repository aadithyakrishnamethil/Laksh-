'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, XCircle, ChevronRight, Zap, BarChart3 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SEED_MASTERY, SEED_SUBJECT_STATS } from '@/lib/db/seed-data'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

type Screen = 'overview' | 'quiz' | 'results'

const MOCK_QUESTIONS = [
  {
    id: 'q1',
    subjectId: 'phy',
    chapterId: 'phy-2',
    chapter: 'Electrostatic Potential & Capacitance',
    difficulty: 3,
    stem: 'A parallel plate capacitor has capacitance C. If the distance between the plates is halved and the area of each plate is doubled, the new capacitance is:',
    options: ['C/2', 'C', '4C', '2C'],
    answer: 2,
  },
  {
    id: 'q2',
    subjectId: 'math',
    chapterId: 'math-7',
    chapter: 'Application of Derivatives',
    difficulty: 4,
    stem: 'The function f(x) = 2x³ – 3x² – 12x + 4 has a local maximum at x =',
    options: ['-1', '2', '-2', '1'],
    answer: 0,
  },
  {
    id: 'q3',
    subjectId: 'chem',
    chapterId: 'chem-9',
    chapter: 'Coordination Compounds',
    difficulty: 3,
    stem: '[Co(NH₃)₆]³⁺ is inner-orbital complex. This means:',
    options: ['It uses 4s orbital', 'It uses d²sp³ hybridization', 'It is paramagnetic', 'It uses sp³d² hybridization'],
    answer: 1,
  },
  {
    id: 'q4',
    subjectId: 'bio',
    chapterId: 'bio-14',
    chapter: 'Ecosystem',
    difficulty: 2,
    stem: 'Which of the following is a correct sequence in an ecosystem?',
    options: ['Sun → Herbivore → Carnivore → Producer', 'Sun → Producer → Herbivore → Carnivore', 'Producer → Sun → Herbivore → Carnivore', 'Herbivore → Producer → Sun → Carnivore'],
    answer: 1,
  },
  {
    id: 'q5',
    subjectId: 'phy',
    chapterId: 'phy-9',
    chapter: 'Ray Optics',
    difficulty: 3,
    stem: 'A convex lens of focal length 20 cm forms a real image 40 cm from the lens. The object distance is:',
    options: ['40 cm', '20 cm', '60 cm', '30 cm'],
    answer: 0,
  },
]

const MASTERY_SUMMARY = SEED_SUBJECT_STATS.map((s) => ({
  subject: s.subject.slice(0, 4),
  mastery: s.mastery,
  target: s.target,
}))

export default function DiagnosticsPage() {
  const [screen, setScreen] = useState<Screen>('overview')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const q = MOCK_QUESTIONS[current]
  const totalQ = MOCK_QUESTIONS.length
  const progress = ((current) / totalQ) * 100

  function selectOption(idx: number) {
    if (revealed) return
    setSelected(idx)
  }

  function confirmAnswer() {
    if (selected === null) return
    setAnswers((prev) => ({ ...prev, [q.id]: selected }))
    setRevealed(true)
  }

  function nextQuestion() {
    if (current + 1 >= totalQ) {
      setScreen('results')
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const correctCount = Object.entries(answers).filter(([id, ans]) => {
    const q = MOCK_QUESTIONS.find((q) => q.id === id)
    return q && ans === q.answer
  }).length

  if (screen === 'quiz') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[var(--text-secondary)]">Question {current + 1} of {totalQ}</span>
            <span className="text-[13px] text-[var(--text-secondary)]">{q.chapter}</span>
          </div>
          <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-[#2A7AFE] to-[#53C8FF]"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={
                    CBSE_SUBJECTS.find((s) => s.id === q.subjectId)?.id === 'phy' ? 'blue' :
                    CBSE_SUBJECTS.find((s) => s.id === q.subjectId)?.id === 'math' ? 'orange' : 'green'
                  }>
                    {CBSE_SUBJECTS.find((s) => s.id === q.subjectId)?.name}
                  </Badge>
                  <Badge variant="default">Difficulty: {q.difficulty}/5</Badge>
                </div>
                <p className="text-[16px] font-medium text-[var(--text-primary)] leading-relaxed mb-6">{q.stem}</p>
                <div className="space-y-3">
                  {q.options.map((opt, idx) => {
                    let cls = 'border border-[var(--border-subtle)] bg-[var(--bg-subtle)]'
                    if (selected === idx && !revealed) cls = 'border-[var(--accent-blue)] bg-blue-50 dark:bg-blue-950/30'
                    if (revealed && idx === q.answer) cls = 'border-[var(--accent-green)] bg-green-50 dark:bg-green-950/30'
                    if (revealed && selected === idx && idx !== q.answer) cls = 'border-[var(--accent-red)] bg-red-50 dark:bg-red-950/30'
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(idx)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] text-left transition-all ${cls}`}
                      >
                        <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-[12px] font-medium shrink-0">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span className="text-[14px] text-[var(--text-primary)]">{opt}</span>
                        {revealed && idx === q.answer && <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] ml-auto" />}
                        {revealed && selected === idx && idx !== q.answer && <XCircle className="w-4 h-4 text-[var(--accent-red)] ml-auto" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {!revealed ? (
            <Button variant="primary" className="flex-1" onClick={confirmAnswer} disabled={selected === null}>
              Confirm Answer
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={nextQuestion}>
              {current + 1 >= totalQ ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (screen === 'results') {
    const pct = Math.round((correctCount / totalQ) * 100)
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <Card className="text-center py-10">
            <div className="text-[64px] mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📚'}</div>
            <h2 className="text-[28px] font-bold text-[var(--text-primary)] mb-2">Diagnostic Complete!</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              {correctCount} of {totalQ} correct · {pct}% accuracy
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={() => { setScreen('overview'); setCurrent(0); setAnswers({}); setSelected(null); setRevealed(false) }}>
                View Mastery Map
              </Button>
              <Button variant="secondary" onClick={() => { setCurrent(0); setAnswers({}); setSelected(null); setRevealed(false); setScreen('quiz') }}>
                Retake
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Result breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}>
          <Card>
            <CardHeader><CardTitle>Answer Review</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_QUESTIONS.map((q, i) => {
                  const ans = answers[q.id]
                  const correct = ans === q.answer
                  return (
                    <div key={q.id} className="flex items-start gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                      {correct ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--accent-red)] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">Q{i + 1}: {q.chapter}</p>
                        <p className="text-[12px] text-[var(--text-secondary)]">
                          {ans !== null && ans !== undefined ? `Your answer: ${q.options[ans]}` : 'Not answered'} ·{' '}
                          <span className="text-[var(--accent-green)]">Correct: {q.options[q.answer]}</span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Overview screen
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Diagnostic Assessment</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">Adaptive test to map your chapter-wise mastery</p>
        </div>
        <Button variant="primary" onClick={() => setScreen('quiz')}>
          <Brain className="w-4 h-4" />
          Start Diagnostic
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />
                <CardTitle>Subject Mastery</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={MASTERY_SUMMARY} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Radar name="Mastery" dataKey="mastery" stroke="#2A7AFE" fill="#2A7AFE" fillOpacity={0.2} strokeWidth={2} animationBegin={0} animationDuration={800} />
                  <Radar name="Target" dataKey="target" stroke="#34C759" fill="#34C759" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 justify-center mt-2">
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
                  <div className="w-3 h-0.5 bg-[#2A7AFE]" />
                  Current
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
                  <div className="w-3 h-0.5 bg-[#34C759] opacity-70 border-b border-dashed border-[#34C759]" />
                  Target
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chapter mastery list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}>
          <Card>
            <CardHeader><CardTitle>Chapter Mastery</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {SEED_MASTERY.map((m) => {
                  const [subId, idx] = m.chapter_id.split('-')
                  const sub = CBSE_SUBJECTS.find((s) => s.id === subId)
                  const chapterName = sub?.chapters[parseInt(idx) - 1]?.name ?? m.chapter_id
                  return (
                    <div key={m.chapter_id} className="flex items-center gap-3">
                      <span className="text-[14px] shrink-0">{sub?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-[var(--text-primary)] truncate">{chapterName}</span>
                          <span className="text-[12px] font-medium text-[var(--text-primary)] ml-2 shrink-0">{m.mastery_pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m.mastery_pct}%`,
                              background: m.label === 'strength' ? '#34C759' : m.label === 'weakness' ? '#FF3B30' : '#FF9F0A',
                            }}
                          />
                        </div>
                      </div>
                      <Badge variant={m.label === 'strength' ? 'green' : m.label === 'weakness' ? 'red' : 'orange'}>
                        {m.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}>
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">Adaptive Diagnostic</h3>
              <p className="text-[13px] text-[var(--text-secondary)]">5 questions · IRT-based · ~10 minutes · updates mastery map</p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setScreen('quiz')}>
            <Brain className="w-4 h-4" />
            Start Now
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}
