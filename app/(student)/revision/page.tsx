'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, CheckCircle2, XCircle, ChevronRight, Search, Lightbulb, Layers } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SEED_MASTERY } from '@/lib/db/seed-data'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

type FlashMode = 'browse' | 'review'
type FlipState = 'front' | 'back'

const SEED_FLASHCARDS = [
  { id: 'fc-1', subjectId: 'phy', chapterId: 'phy-9', front: 'State the mirror formula', back: '1/v + 1/u = 1/f\nwhere v = image distance, u = object distance, f = focal length' },
  { id: 'fc-2', subjectId: 'chem', chapterId: 'chem-3', front: 'What is Faraday\'s 1st law of electrolysis?', back: 'The mass of substance deposited at an electrode is directly proportional to the quantity of charge passed: m = ZQ where Z = electrochemical equivalent' },
  { id: 'fc-3', subjectId: 'math', chapterId: 'math-7', front: 'When is a function f(x) strictly increasing?', back: 'f(x) is strictly increasing on (a, b) if f\'(x) > 0 for all x ∈ (a, b)' },
  { id: 'fc-4', subjectId: 'bio', chapterId: 'bio-5', front: 'What is the central dogma of molecular biology?', back: 'DNA → (Transcription) → mRNA → (Translation) → Protein\nInformation flows from DNA to RNA to Protein' },
  { id: 'fc-5', subjectId: 'phy', chapterId: 'phy-2', front: 'Define capacitance', back: 'Capacitance is the ability of a capacitor to store charge: C = Q/V (measured in Farads)' },
]

const WEAKNESS_CHAPTERS = SEED_MASTERY.filter((m) => m.label === 'weakness').slice(0, 5)

export default function RevisionPage() {
  const [mode, setMode] = useState<FlashMode>('browse')
  const [cardIndex, setCardIndex] = useState(0)
  const [flip, setFlip] = useState<FlipState>('front')
  const [doubt, setDoubt] = useState('')
  const [solution, setSolution] = useState<string | null>(null)
  const [solving, setSolving] = useState(false)
  const [tab, setTab] = useState<'flashcards' | 'doubt' | 'queue'>('flashcards')

  const card = SEED_FLASHCARDS[cardIndex]
  const sub = CBSE_SUBJECTS.find((s) => s.id === card?.subjectId)

  async function solveDoubt() {
    if (!doubt.trim()) return
    setSolving(true)
    try {
      const res = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: doubt, subjectId: 'phy' }),
      })
      const data = await res.json()
      setSolution(data.steps?.map((s: { explanation: string }) => s.explanation).join('\n\n') ?? data.answer ?? 'No solution available')
    } catch {
      setSolution('Could not get a solution. Please try again.')
    } finally {
      setSolving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Revision Center</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">Flashcards, doubt solver, and revision queue</p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-[var(--radius-pill)] p-1 w-fit">
        {([
          { id: 'flashcards', label: 'Flashcards', icon: Layers },
          { id: 'doubt',      label: 'Doubt Solver', icon: Lightbulb },
          { id: 'queue',      label: 'Revision Queue', icon: RotateCcw },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              tab === id ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'flashcards' && (
          <motion.div key="flash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Flashcard viewer */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg perspective-1000">
                <motion.div
                  className="relative w-full h-52 cursor-pointer"
                  onClick={() => setFlip((f) => f === 'front' ? 'back' : 'front')}
                  animate={{ rotateY: flip === 'back' ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <Card className="absolute inset-0 flex items-center justify-center backface-hidden">
                    <CardContent className="text-center">
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <span className="text-[20px]">{sub?.icon}</span>
                        <Badge variant="blue">{sub?.name}</Badge>
                        <Badge variant="default">Front</Badge>
                      </div>
                      <p className="text-[18px] font-semibold text-[var(--text-primary)]">{card?.front}</p>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-4">Tap to reveal answer</p>
                    </CardContent>
                  </Card>
                  {/* Back */}
                  <Card className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                    <CardContent className="text-center">
                      <Badge variant="green" className="mb-3">Answer</Badge>
                      <p className="text-[15px] font-medium text-[var(--text-primary)] whitespace-pre-line leading-relaxed">{card?.back}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => { setCardIndex((i) => Math.max(0, i - 1)); setFlip('front') }}
                disabled={cardIndex === 0}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
              <span className="text-[13px] text-[var(--text-secondary)] w-16 text-center">
                {cardIndex + 1} / {SEED_FLASHCARDS.length}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => { setCardIndex((i) => Math.min(SEED_FLASHCARDS.length - 1, i + 1)); setFlip('front') }}
                disabled={cardIndex === SEED_FLASHCARDS.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {flip === 'back' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-center">
                <Button variant="outline" className="gap-2 border-[var(--accent-red)] text-[var(--accent-red)]"
                  onClick={() => { setCardIndex((i) => (i + 1) % SEED_FLASHCARDS.length); setFlip('front') }}>
                  <XCircle className="w-4 h-4" /> Didn&apos;t know
                </Button>
                <Button variant="outline" className="gap-2 border-[var(--accent-green)] text-[var(--accent-green)]"
                  onClick={() => { setCardIndex((i) => (i + 1) % SEED_FLASHCARDS.length); setFlip('front') }}>
                  <CheckCircle2 className="w-4 h-4" /> Got it!
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'doubt' && (
          <motion.div key="doubt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[var(--accent-orange)]" />
                  <CardTitle>AI Doubt Solver</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={doubt}
                  onChange={(e) => setDoubt(e.target.value)}
                  placeholder="Type your doubt or question here... e.g. 'How do I derive the mirror formula?'"
                  rows={3}
                  className="w-full bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--accent-blue)] resize-none"
                />
                <Button variant="primary" onClick={solveDoubt} loading={solving} disabled={!doubt.trim()}>
                  <Lightbulb className="w-4 h-4" />
                  Solve with AI
                </Button>
                {solution && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-[var(--radius-lg)] border border-blue-100 dark:border-blue-900"
                  >
                    <p className="text-[13px] font-semibold text-[var(--accent-blue)] mb-2">Solution</p>
                    <p className="text-[14px] text-[var(--text-primary)] whitespace-pre-line leading-relaxed">{solution}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Revision Queue</CardTitle>
                <p className="text-[13px] text-[var(--text-secondary)]">Weak chapters sorted by priority</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {WEAKNESS_CHAPTERS.map((m, i) => {
                    const [subId] = m.chapter_id.split('-')
                    const chapIdx = parseInt(m.chapter_id.split('-')[1]) - 1
                    const sub = CBSE_SUBJECTS.find((s) => s.id === subId)
                    const chap = sub?.chapters[chapIdx]
                    return (
                      <div key={m.chapter_id} className="flex items-center gap-3 p-3.5 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center text-[13px] font-bold text-[var(--accent-red)]">
                          {i + 1}
                        </div>
                        <span className="text-[18px]">{sub?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{chap?.name ?? m.chapter_id}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 max-w-[100px] h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[var(--accent-red)]" style={{ width: `${m.mastery_pct}%` }} />
                            </div>
                            <span className="text-[12px] text-[var(--accent-red)]">{m.mastery_pct}% mastery</span>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm">
                          Revise <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
