// Realistic seed data used when Supabase is not available
import { addDays, subDays, format } from 'date-fns'

const today = new Date()

export const SEED_STUDENT = {
  id: 'seed-student-anya',
  role: 'student' as const,
  full_name: 'Anya Sharma',
  avatar_url: null,
  board: 'CBSE',
  class: '12',
  target_exam_date: '2025-03-15',
  theme_pref: 'system' as const,
  created_at: subDays(today, 45).toISOString(),
}

export const SEED_GOAL = {
  id: 'seed-goal-1',
  student_id: SEED_STUDENT.id,
  target_overall_pct: 92,
  status: 'active' as const,
  created_at: subDays(today, 40).toISOString(),
}

export const SEED_SUBJECT_GOALS = [
  { id: 'sg-1', goal_id: SEED_GOAL.id, subject_id: 'phy',  target_pct: 90, required_effort_hrs: 48, ai_feasibility: 'stretch'   as const, ai_rationale: 'Physics requires extra focus on Optics and Electrostatics.' },
  { id: 'sg-2', goal_id: SEED_GOAL.id, subject_id: 'chem', target_pct: 92, required_effort_hrs: 36, ai_feasibility: 'feasible'  as const, ai_rationale: 'Good base in Organic Chemistry. Inorganic needs more work.' },
  { id: 'sg-3', goal_id: SEED_GOAL.id, subject_id: 'math', target_pct: 95, required_effort_hrs: 60, ai_feasibility: 'stretch'   as const, ai_rationale: 'Integration and Calculus need daily practice to hit 95%.' },
  { id: 'sg-4', goal_id: SEED_GOAL.id, subject_id: 'bio',  target_pct: 88, required_effort_hrs: 30, ai_feasibility: 'feasible'  as const, ai_rationale: 'Strong in Genetics. Ecology and Biotechnology need revision.' },
  { id: 'sg-5', goal_id: SEED_GOAL.id, subject_id: 'eng',  target_pct: 90, required_effort_hrs: 20, ai_feasibility: 'feasible'  as const, ai_rationale: 'Writing skills are strong. Focus on comprehension timing.' },
]

export const SEED_MASTERY = [
  // Physics
  { chapter_id: 'phy-1',  mastery_pct: 78, label: 'neutral'  as const, confidence: 0.7 },
  { chapter_id: 'phy-2',  mastery_pct: 62, label: 'weakness' as const, confidence: 0.5 },
  { chapter_id: 'phy-3',  mastery_pct: 85, label: 'strength' as const, confidence: 0.8 },
  { chapter_id: 'phy-4',  mastery_pct: 55, label: 'weakness' as const, confidence: 0.4 },
  { chapter_id: 'phy-6',  mastery_pct: 72, label: 'neutral'  as const, confidence: 0.6 },
  { chapter_id: 'phy-9',  mastery_pct: 48, label: 'weakness' as const, confidence: 0.4 },
  { chapter_id: 'phy-14', mastery_pct: 90, label: 'strength' as const, confidence: 0.9 },
  // Chemistry
  { chapter_id: 'chem-3',  mastery_pct: 82, label: 'strength' as const, confidence: 0.8 },
  { chapter_id: 'chem-7',  mastery_pct: 65, label: 'neutral'  as const, confidence: 0.6 },
  { chapter_id: 'chem-12', mastery_pct: 88, label: 'strength' as const, confidence: 0.85 },
  { chapter_id: 'chem-9',  mastery_pct: 45, label: 'weakness' as const, confidence: 0.3 },
  // Mathematics
  { chapter_id: 'math-5',  mastery_pct: 70, label: 'neutral'  as const, confidence: 0.65 },
  { chapter_id: 'math-6',  mastery_pct: 58, label: 'weakness' as const, confidence: 0.5 },
  { chapter_id: 'math-7',  mastery_pct: 50, label: 'weakness' as const, confidence: 0.45 },
  { chapter_id: 'math-13', mastery_pct: 92, label: 'strength' as const, confidence: 0.9 },
  { chapter_id: 'math-1',  mastery_pct: 88, label: 'strength' as const, confidence: 0.85 },
  // Biology
  { chapter_id: 'bio-5',  mastery_pct: 95, label: 'strength' as const, confidence: 0.95 },
  { chapter_id: 'bio-6',  mastery_pct: 80, label: 'neutral'  as const, confidence: 0.75 },
  { chapter_id: 'bio-11', mastery_pct: 60, label: 'neutral'  as const, confidence: 0.55 },
  { chapter_id: 'bio-14', mastery_pct: 45, label: 'weakness' as const, confidence: 0.4 },
]

export const SEED_PREDICTIONS = Array.from({ length: 10 }, (_, i) => ({
  id: `pred-${i}`,
  student_id: SEED_STUDENT.id,
  predicted_overall_pct: 72 + i * 2.2,
  confidence_pct: 68 + i,
  per_subject: {
    phy:  { predicted: 70 + i * 2,   target: 90, gap: -(20 - i * 2) },
    chem: { predicted: 75 + i * 1.5, target: 92, gap: -(17 - i * 1.5) },
    math: { predicted: 68 + i * 2.5, target: 95, gap: -(27 - i * 2.5) },
    bio:  { predicted: 80 + i,       target: 88, gap: -(8 - i) },
    eng:  { predicted: 78 + i * 1.2, target: 90, gap: -(12 - i * 1.2) },
  },
  risk_level: i < 4 ? 'at-risk' as const : i < 7 ? 'on-track' as const : 'on-track' as const,
  generated_at: subDays(today, 45 - i * 5).toISOString(),
}))

export const SEED_STREAK = {
  student_id: SEED_STUDENT.id,
  current: 12,
  longest: 21,
  last_active: format(today, 'yyyy-MM-dd'),
}

export const SEED_XP = 2340

export const SEED_LEVEL = Math.floor(SEED_XP / 500) + 1

export const SEED_PRODUCTIVITY = Array.from({ length: 14 }, (_, i) => ({
  date: format(subDays(today, 13 - i), 'yyyy-MM-dd'),
  minutes_studied: [45, 90, 60, 0, 120, 85, 75, 30, 95, 110, 60, 0, 90, 105][i],
  tasks_done: [1, 3, 2, 0, 4, 3, 2, 1, 3, 4, 2, 0, 3, 4][i],
}))

export const SEED_PLAN_TASKS = Array.from({ length: 14 }, (_, i) => {
  const d = addDays(today, i - 2)
  const dayOfWeek = d.getDay()
  if (dayOfWeek === 0) return null
  const subjects = ['phy', 'chem', 'math', 'bio', 'eng']
  const chapters = ['phy-2', 'chem-9', 'math-7', 'bio-14', 'eng-4', 'phy-4', 'math-6']
  const types: ('learn' | 'practice' | 'revise')[] = ['learn', 'practice', 'revise', 'learn', 'practice', 'revise', 'learn']
  const subIdx = i % subjects.length
  return {
    id: `task-${i}`,
    plan_id: 'seed-plan-1',
    date: format(d, 'yyyy-MM-dd'),
    subject_id: subjects[subIdx],
    chapter_id: chapters[i % chapters.length],
    type: types[i % types.length],
    est_minutes: 45 + (i % 3) * 15,
    status: (i < 2 ? 'done' : i === 2 ? 'missed' : 'pending') as 'done' | 'missed' | 'pending',
    rescheduled_from: null,
  }
}).filter(Boolean) as Array<{
  id: string; plan_id: string; date: string; subject_id: string;
  chapter_id: string; type: 'learn' | 'practice' | 'revise';
  est_minutes: number; status: 'done' | 'missed' | 'pending'; rescheduled_from: null
}>

export const SEED_BURNOUT = {
  level: 'watch' as const,
  score: 42,
  factors: { missed_tasks: 15, focus_quality: 12, late_nights: 10, streak: 5 },
  interventions: ['Take 5-min breaks every 45 minutes', 'Avoid studying past 11 PM'],
  message: 'Mild fatigue detected. Small adjustments now will prevent burnout later.',
}

export const SEED_RECENT_ACTIVITY = [
  { text: 'Completed Chapter 5 Quiz – Magnetism', time: '1 hour ago', type: 'quiz' },
  { text: 'Studied Electrochemistry for 45 min', time: '3 hours ago', type: 'study' },
  { text: 'Generated Flashcards for Organic Chemistry', time: 'Yesterday', type: 'flashcard' },
  { text: 'Earned "Rising Star" badge 🌟', time: 'Yesterday', type: 'achievement' },
  { text: 'Completed Mock Test – Physics Paper 1', time: '2 days ago', type: 'test' },
]

export const SEED_WEEKLY_CHART = [
  { day: 'Mon', goalHrs: 1.5, focusScore: 72 },
  { day: 'Tue', goalHrs: 2.0, focusScore: 85 },
  { day: 'Wed', goalHrs: 1.0, focusScore: 65 },
  { day: 'Thu', goalHrs: 2.5, focusScore: 90 },
  { day: 'Fri', goalHrs: 3.0, focusScore: 88 },
]

export const SEED_SUBJECT_STATS = [
  { subject: 'Physics',  mastery: 72, target: 90, color: '#2A7AFE' },
  { subject: 'Chemistry', mastery: 75, target: 92, color: '#34C759' },
  { subject: 'Math',     mastery: 68, target: 95, color: '#FF9F0A' },
  { subject: 'Biology',  mastery: 76, target: 88, color: '#FF3B30' },
  { subject: 'English',  mastery: 82, target: 90, color: '#675178' },
]
