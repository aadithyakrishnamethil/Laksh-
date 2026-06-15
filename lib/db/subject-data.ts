// Derives realistic per-subject demo content (mastery, goals, plan tasks) from
// each subject's chapter list in constants. This lets ANY selected subject —
// including ones with no hand-written seed data — render coherently.
import { CBSE_SUBJECTS } from '@/lib/utils/constants'
import type { Feasibility, MasteryLabel, TaskType } from '@/types'
import { addDays, format } from 'date-fns'

/** Tiny deterministic string hash so derived values are stable across renders. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface SubjectMeta {
  id: string
  name: string
  icon: string
  color: string
}

export function getSubjectMeta(id: string): SubjectMeta | undefined {
  const s = CBSE_SUBJECTS.find((x) => x.id === id)
  return s && { id: s.id, name: s.name, icon: s.icon, color: s.color }
}

export interface DerivedChapter {
  chapter_id: string
  subject_id: string
  name: string
  weightage: number
  mastery_pct: number
  label: MasteryLabel
}

function labelFor(mastery: number): MasteryLabel {
  return mastery >= 80 ? 'strength' : mastery < 60 ? 'weakness' : 'neutral'
}

/** Chapters for a subject, each with a stable pseudo-random mastery score. */
export function getSubjectChapters(subjectId: string): DerivedChapter[] {
  const sub = CBSE_SUBJECTS.find((s) => s.id === subjectId)
  if (!sub) return []
  return sub.chapters.map((c, i) => {
    const mastery = 45 + (hash(sub.id + c.name) % 51) // 45–95
    return {
      chapter_id: `${sub.id}-${i + 1}`,
      subject_id: sub.id,
      name: c.name,
      weightage: c.weightage,
      mastery_pct: mastery,
      label: labelFor(mastery),
    }
  })
}

export interface SubjectStat {
  id: string
  subject: string
  icon: string
  color: string
  mastery: number
  target: number
}

/** Average mastery + target for a subject. */
export function getSubjectStat(subjectId: string, targetPct = 90): SubjectStat | undefined {
  const meta = getSubjectMeta(subjectId)
  if (!meta) return undefined
  const chapters = getSubjectChapters(subjectId)
  const mastery = chapters.length
    ? Math.round(chapters.reduce((a, c) => a + c.mastery_pct, 0) / chapters.length)
    : 50
  return { id: meta.id, subject: meta.name, icon: meta.icon, color: meta.color, mastery, target: targetPct }
}

export interface DerivedSubjectGoal {
  subject_id: string
  target_pct: number
  current_mastery: number
  required_effort_hrs: number
  ai_feasibility: Feasibility
  ai_rationale: string
}

/**
 * Per-subject goal derived from current mastery and the overall target.
 * Mirrors the mock AI's logic so the static Goals view matches "Analyse with AI".
 */
export function getSubjectGoal(
  subjectId: string,
  targetPct: number,
  weeksRemaining: number
): DerivedSubjectGoal {
  const stat = getSubjectStat(subjectId, targetPct)
  const current = stat?.mastery ?? 50
  const gap = Math.max(0, targetPct - current)
  const requiredEffortHrs = Math.max(4, Math.round((gap / 100) * weeksRemaining * 2))
  const feasibility: Feasibility = gap < 20 ? 'feasible' : gap < 40 ? 'stretch' : 'unlikely'
  const rationale =
    feasibility === 'feasible'
      ? `Current mastery (${current}%) is close to target — consistent practice will get you there.`
      : feasibility === 'stretch'
      ? `There's a ${gap}% gap; focused daily sessions will close it before the exam.`
      : `The ${gap}% gap needs intensive effort. Prioritise high-weightage chapters first.`
  return {
    subject_id: subjectId,
    target_pct: targetPct,
    current_mastery: current,
    required_effort_hrs: requiredEffortHrs,
    ai_feasibility: feasibility,
    ai_rationale: rationale,
  }
}

export interface DerivedTask {
  id: string
  plan_id: string
  date: string
  subject_id: string
  chapter_id: string
  type: TaskType
  est_minutes: number
  status: 'pending' | 'done' | 'missed'
  rescheduled_from: string | null
}

/**
 * A two-week study plan spread across the selected subjects, prioritising their
 * weakest chapters. Deterministic so the planner is stable between visits.
 */
export function getPlanTasksForSubjects(subjectIds: string[]): DerivedTask[] {
  if (subjectIds.length === 0) return []
  const today = new Date()
  const types: TaskType[] = ['learn', 'practice', 'revise']
  // Weakest chapters first within each subject.
  const weakBySubject = subjectIds.map((id) =>
    getSubjectChapters(id).slice().sort((a, b) => a.mastery_pct - b.mastery_pct)
  )

  const tasks: DerivedTask[] = []
  let n = 0
  for (let day = 0; day < 14; day++) {
    const d = addDays(today, day - 2)
    if (d.getDay() === 0) continue // skip Sundays
    const subjIdx = day % subjectIds.length
    const subjectId = subjectIds[subjIdx]
    const chapters = weakBySubject[subjIdx]
    if (chapters.length === 0) continue
    const chapter = chapters[day % chapters.length]
    const type = types[n % types.length]
    tasks.push({
      id: `gen-${subjectId}-${day}`,
      plan_id: 'demo-plan',
      date: format(d, 'yyyy-MM-dd'),
      subject_id: subjectId,
      chapter_id: chapter.chapter_id,
      type,
      est_minutes: type === 'practice' ? 45 : type === 'revise' ? 30 : 60,
      status: day < 2 ? 'done' : day === 2 ? 'missed' : 'pending',
      rescheduled_from: null,
    })
    n++
  }
  return tasks
}

/** CBSE_SUBJECTS filtered & ordered to a selection. */
export function subjectsInOrder(selectedIds: string[]) {
  return CBSE_SUBJECTS.filter((s) => selectedIds.includes(s.id))
}
