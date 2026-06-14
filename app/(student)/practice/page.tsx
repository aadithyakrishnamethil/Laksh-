'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, XCircle, ChevronRight, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

type Screen = 'browse' | 'quiz' | 'results'

const PRACTICE_PAPERS = [
  { id: 'pp-1', subjectId: 'phy', name: 'Physics — Optics & Waves', chapters: ['Ray Optics', 'Wave Optics'], questions: 15, duration: 30 },
  { id: 'pp-2', subjectId: 'math', name: 'Mathematics — Calculus', chapters: ['Limits', 'Derivatives', 'Integrals'], questions: 12, duration: 25 },
  { id: 'pp-3', subjectId: 'chem', name: 'Chemistry — Organic', chapters: ['Haloalkanes', 'Aldehydes', 'Amines'], questions: 10, duration: 20 },
  { id: 'pp-4', subjectId: 'bio', name: 'Biology — Genetics', chapters: ['Heredity', 'Molecular Basis'], questions: 15, duration: 30 },
  { id: 'pp-5', subjectId: 'phy', name: 'Physics — Electrostatics', chapters: ['Electric Field', 'Capacitors'], questions: 10, duration: 20 },
]

const QUICK_QUESTIONS = [
  { id: 'q1', stem: 'A ray of light passes from glass (n=1.5) to air. The critical angle is:', options: ['41.8°', '33.4°', '48.2°', '30.0°'], answer: 0, explanation: 'sin(c) = 1/n = 1/1.5, so c = sin⁻¹(0.667) ≈ 41.8°' },
  { id: 'q2', stem: 'The derivative of ln(sin x) with respect to x is:', options: ['cos x', 'cot x', 'tan x', '1/sin x'], answer: 1, explanation: 'd/dx[ln(sin x)] = cos x / sin x = cot x' },
  { id: 'q3', stem: 'Which of the following is an aldose sugar?', options: ['Fructose', 'Glucose', 'Sucrose', 'Galactose'], answer: 1, explanation: 'Glucose is an aldose sugar as it has an aldehyde group at C-1.' },
]

export default function PracticePage() {
  const [screen, setScreen] = useState<Screen>('browse')
  const [filterSub, setFilterSub] = useState<string | null>(null)
  const [activePaper, setActivePaper] = useState<typeof PRACTICE_PAPERS[0] | null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (screen !== 'quiz' || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [screen, timeLeft])

  function startPaper(paper: typeof PRACTICE_PAPERS[0]) {
    setActivePaper(paper)
    setQIdx(0)
    setSelected(null)
    setRevealed(false)
    setAnswers({})
    setTimeLeft(paper.duration * 60)
    setScreen('quiz')
  }

  function next() {
    if (qIdx + 1 >= QUICK_QUESTIONS.length) {
      setScreen('results')
    } else {
      setAnswers((a) => ({ ...a, [QUICK_QUESTIONS[qIdx].id]: selected }))
      setQIdx((i) => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const correctCount = Object.entries(answers).filter(([id, ans]) => {
    const q = QUICK_QUESTIONS.find((q) => q.id === id)
    return q && ans === q.answer
  }).length

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const filtered = filterSub ? PRACTICE_PAPERS.filter((p) => p.subjectId === filterSub) : PRACTICE_PAPERS

  if (screen === 'quiz' && activePaper) {
    const q = QUICK_QUESTIONS[qIdx]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[var(--text-primary)]">{activePaper.name}</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Q{qIdx + 1} of {QUICK_QUESTIONS.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[14px] font-bold ${timeLeft < 60 ? 'bg-red-50 text-[var(--accent-red)]' : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'}`}>
            <Timer className="w-4 h-4" />
            {mins}:{secs}
          </div>
        </div>
        <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2A7AFE] to-[#53C8FF] rounded-full transition-all" style={{ width: `${(qIdx / QUICK_QUESTIONS.length) * 100}%` }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-[16px] font-medium text-[var(--text-primary)] leading-relaxed">{q.stem}</p>
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    let cls = 'border-[var(--border-subtle)] bg-[var(--bg-subtle)]'
                    if (selected === i && !revealed) cls = 'border-[var(--accent-blue)] bg-blue-50 dark:bg-blue-950/30'
                    if (revealed && i === q.answer) cls = 'border-[var(--accent-green)] bg-green-50 dark:bg-green-950/30'
                    if (revealed && selected === i && i !== q.answer) cls = 'border-[var(--accent-red)] bg-red-50 dark:bg-red-950/30'
                    return (
                      <button
                        key={i}
                        onClick={() => !revealed && setSelected(i)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] text-left border transition-all ${cls}`}
                      >
                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0">
                          {['A','B','C','D'][i]}
                        </span>
                        <span className="text-[14px] text-[var(--text-primary)] flex-1">{opt}</span>
                        {revealed && i === q.answer && <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)] shrink-0" />}
                        {revealed && selected === i && i !== q.answer && <XCircle className="w-4 h-4 text-[var(--accent-red)] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-[var(--radius-lg)]">
                    <p className="text-[13px] font-semibold text-[var(--accent-blue)] mb-1">Explanation</p>
                    <p className="text-[13px] text-[var(--text-secondary)]">{q.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-3">
          {!revealed ? (
            <Button variant="primary" className="flex-1" onClick={() => { setRevealed(true); setAnswers((a) => ({ ...a, [q.id]: selected })) }} disabled={selected === null}>
              Confirm Answer
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={next}>
              {qIdx + 1 >= QUICK_QUESTIONS.length ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (screen === 'results') {
    const pct = Math.round((correctCount / QUICK_QUESTIONS.length) * 100)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-10">
          <div className="text-[60px] mb-4">{pct >= 70 ? '🎉' : '📚'}</div>
          <h2 className="text-[24px] font-bold text-[var(--text-primary)] mb-2">{correctCount}/{QUICK_QUESTIONS.length} correct</h2>
          <p className="text-[var(--text-secondary)] mb-6">Score: {pct}%</p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => setScreen('browse')}>Browse More Papers</Button>
            <Button variant="secondary" onClick={() => { setQIdx(0); setAnswers({}); setSelected(null); setRevealed(false); setScreen('quiz') }}>Retry</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Practice Papers</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">Chapter-wise timed practice with solutions</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <div className="flex gap-1">
            <button onClick={() => setFilterSub(null)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${filterSub === null ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}>All</button>
            {CBSE_SUBJECTS.slice(0, 4).map((s) => (
              <button key={s.id} onClick={() => setFilterSub(s.id)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${filterSub === s.id ? 'text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`} style={filterSub === s.id ? { background: s.color } : {}}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((paper, i) => {
          const sub = CBSE_SUBJECTS.find((s) => s.id === paper.subjectId)
          return (
            <motion.div key={paper.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}>
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[22px]">{sub?.icon}</span>
                    <Badge variant="default">{sub?.name}</Badge>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">{paper.name}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-[var(--text-secondary)] mb-4">
                    <span>{paper.questions} questions</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{paper.duration} min</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {paper.chapters.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => startPaper(paper)}>
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
