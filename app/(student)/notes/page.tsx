'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, ChevronRight, Loader2, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'

type Note = { chapterId: string; chapterName: string; subjectName: string; content: string; generatedAt: Date }

const SEED_NOTE: Note = {
  chapterId: 'phy-9',
  chapterName: 'Ray Optics and Optical Instruments',
  subjectName: 'Physics',
  content: `# Ray Optics and Optical Instruments

## Key Concepts

### 1. Reflection of Light
- **Law of Reflection**: Angle of incidence = Angle of reflection
- **Mirror Formula**: \`1/v + 1/u = 1/f\`
- **Magnification**: \`m = -v/u\`

### 2. Refraction of Light
- **Snell's Law**: \`n₁ sin θ₁ = n₂ sin θ₂\`
- **Refractive Index**: \`n = c/v\`
- **Total Internal Reflection** occurs when θ > critical angle

### 3. Lenses
- **Lens Formula**: \`1/v - 1/u = 1/f\`
- **Power of Lens**: \`P = 1/f\` (in dioptres)
- **Combined Power**: \`P = P₁ + P₂ - d·P₁·P₂\`

### 4. Optical Instruments
| Instrument | Magnification |
|---|---|
| Simple Microscope | \`m = 1 + D/f\` |
| Compound Microscope | \`m = (L/fo)(1 + D/fe)\` |
| Telescope | \`m = fo/fe\` |

## Common Board Questions
1. Derive the mirror formula using ray diagrams
2. Explain total internal reflection and list 2 applications
3. A lens has power +2.5 D — find focal length and type

## Mnemonics
- **RPCDI**: Real, Positive, Converging, Diminished, Inverted (for objects beyond 2F in convex lens)
`,
  generatedAt: new Date(),
}

export default function NotesPage() {
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [selectedChap, setSelectedChap] = useState<{ id: string; name: string } | null>(null)
  const [notes, setNotes] = useState<Note[]>([SEED_NOTE])
  const [generating, setGenerating] = useState(false)
  const [viewNote, setViewNote] = useState<Note | null>(SEED_NOTE)
  const [copied, setCopied] = useState(false)

  async function generateNote() {
    if (!selectedChap || !selectedSub) return
    const sub = CBSE_SUBJECTS.find((s) => s.id === selectedSub)
    if (!sub) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: selectedChap.id, chapterName: selectedChap.name, subjectName: sub.name }),
      })
      const { notes: content } = await res.json()
      const note: Note = { chapterId: selectedChap.id, chapterName: selectedChap.name, subjectName: sub.name, content, generatedAt: new Date() }
      setNotes((prev) => [note, ...prev.filter((n) => n.chapterId !== selectedChap.id)])
      setViewNote(note)
    } catch {
      // ignore
    } finally {
      setGenerating(false)
      setSelectedChap(null)
      setSelectedSub(null)
    }
  }

  async function copyNote() {
    if (!viewNote) return
    await navigator.clipboard.writeText(viewNote.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Notes</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">AI-generated structured revision notes by chapter</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Generator + list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          className="space-y-4"
        >
          {/* Generate panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-blue)]" />
                <CardTitle>Generate Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-2">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {CBSE_SUBJECTS.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSub(s.id); setSelectedChap(null) }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                        selectedSub === s.id
                          ? 'text-white'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                      style={selectedSub === s.id ? { background: s.color } : {}}
                    >
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>
              {selectedSub && (
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-2">Chapter</label>
                  <select
                    value={selectedChap?.id ?? ''}
                    onChange={(e) => {
                      const sub = CBSE_SUBJECTS.find((s) => s.id === selectedSub)
                      const idx = parseInt(e.target.value)
                      if (sub && !isNaN(idx)) {
                        setSelectedChap({ id: `${selectedSub}-${idx + 1}`, name: sub.chapters[idx].name })
                      } else {
                        setSelectedChap(null)
                      }
                    }}
                    className="w-full bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-blue)] border-none"
                  >
                    <option value="">Select chapter...</option>
                    {CBSE_SUBJECTS.find((s) => s.id === selectedSub)?.chapters.map((c, i) => (
                      <option key={i} value={i}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                variant="primary"
                className="w-full"
                disabled={!selectedChap || generating}
                onClick={generateNote}
                loading={generating}
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate Notes'}
              </Button>
            </CardContent>
          </Card>

          {/* Note list */}
          <Card>
            <CardHeader><CardTitle>Saved Notes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notes.map((n) => {
                  const sub = CBSE_SUBJECTS.find((s) => s.name === n.subjectName || s.id === n.chapterId.split('-')[0])
                  return (
                    <button
                      key={n.chapterId}
                      onClick={() => setViewNote(n)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-lg)] transition-all ${
                        viewNote?.chapterId === n.chapterId ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span className="text-[16px]">{sub?.icon ?? '📒'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{n.chapterName}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{n.subjectName}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Note viewer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="md:col-span-2"
        >
          <AnimatePresence mode="wait">
            {viewNote ? (
              <motion.div key={viewNote.chapterId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{viewNote.chapterName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="blue">{viewNote.subjectName}</Badge>
                          <Badge variant="default">
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                          </Badge>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {format(viewNote.generatedAt, 'd MMM yyyy')}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={copyNote}>
                        {copied ? <Check className="w-4 h-4 text-[var(--accent-green)]" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-code:bg-[var(--bg-subtle)] prose-code:px-1 prose-code:rounded overflow-y-auto max-h-[600px] pr-1">
                      <ReactMarkdown>{viewNote.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <Card className="h-full flex flex-col items-center justify-center py-20">
                  <BookOpen className="w-12 h-12 text-[var(--border-subtle)] mb-4" />
                  <p className="text-[16px] font-medium text-[var(--text-primary)] mb-1">No note selected</p>
                  <p className="text-[13px] text-[var(--text-secondary)]">Generate or select a note from the left</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
