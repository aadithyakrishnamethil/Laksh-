'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, Award, BarChart3, BookOpen, Play } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

const MOCK_TESTS = [
  {
    id: 'mt-1',
    name: 'CBSE Class 12 — Full Board Simulation',
    board: 'CBSE',
    year: '2024',
    totalMarks: 500,
    duration: 180,
    sections: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
    difficulty: 'board',
  },
  {
    id: 'mt-2',
    name: 'Physics Unit Test — Optics & Modern',
    board: 'CBSE',
    year: null,
    totalMarks: 70,
    duration: 60,
    sections: ['Optics', 'Dual Nature', 'Atoms & Nuclei'],
    difficulty: 'medium',
  },
  {
    id: 'mt-3',
    name: 'Chemistry Full Syllabus Mock',
    board: 'CBSE',
    year: '2023',
    totalMarks: 70,
    duration: 60,
    sections: ['Physical', 'Inorganic', 'Organic'],
    difficulty: 'hard',
  },
]

const PAST_ATTEMPTS = [
  { id: 'a-1', testName: 'Physics Unit Test', score: 52, total: 70, pct: 74, date: '2025-03-01', percentile: 68 },
  { id: 'a-2', testName: 'Chemistry Full Syllabus', score: 58, total: 70, pct: 83, date: '2025-02-20', percentile: 82 },
]

const DIFF_VARIANT: Record<string, 'orange' | 'red' | 'blue'> = {
  medium: 'orange', hard: 'red', board: 'blue',
}

export default function MockTestsPage() {
  const [started, setStarted] = useState<string | null>(null)

  if (started) {
    const test = MOCK_TESTS.find((t) => t.id === started)!
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-12">
          <div className="text-[64px] mb-4">🎓</div>
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2">{test.name}</h2>
          <p className="text-[var(--text-secondary)] mb-2">
            {test.totalMarks} marks · {test.duration} minutes
          </p>
          <div className="flex justify-center gap-2 mb-6">
            {test.sections.map((s) => <Badge key={s} variant="default">{s}</Badge>)}
          </div>
          <p className="text-[14px] text-[var(--text-secondary)] mb-6">
            Full test UI with timed sections, answer navigation, and detailed analysis will be available in the complete build.
          </p>
          <Button variant="primary" onClick={() => setStarted(null)}>Return to Tests</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Mock Tests</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">Full CBSE board exam simulation with rank analysis</p>
      </motion.div>

      {/* Test cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_TESTS.map((test, i) => (
          <motion.div key={test.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.07, ease: 'easeOut' }}>
            <Card hoverable>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{test.name}</h3>
                  <Badge variant={DIFF_VARIANT[test.difficulty] ?? 'default'}>{test.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{test.duration} min</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{test.totalMarks} marks</span>
                  {test.year && <><span>·</span><span>Board {test.year}</span></>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {test.sections.map((s) => <Badge key={s} variant="default">{s}</Badge>)}
                </div>
                <Button variant="primary" className="w-full gap-2" onClick={() => setStarted(test.id)}>
                  <Play className="w-4 h-4" /> Start Test
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Past attempts */}
      {PAST_ATTEMPTS.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />
                <CardTitle>Past Attempts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PAST_ATTEMPTS.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
                    <ProgressRing value={a.pct} size={52} status={a.pct >= 80 ? 'on-track' : a.pct >= 60 ? 'at-risk' : 'critical'}>
                      <span className="text-[11px] font-bold">{a.pct}%</span>
                    </ProgressRing>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--text-primary)]">{a.testName}</p>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        {a.score}/{a.total} · {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[13px] font-medium text-[var(--text-primary)]">
                        <Award className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        P{a.percentile}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">percentile</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
