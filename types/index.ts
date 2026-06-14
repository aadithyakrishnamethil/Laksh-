// ─── Database Row Types ────────────────────────────────────────────────────

export type UserRole = 'student' | 'parent' | 'teacher'
export type ThemePref = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  board: string
  class: string
  target_exam_date: string | null
  theme_pref: ThemePref
  created_at: string
}

export interface ParentLink {
  parent_id: string
  student_id: string
  status: 'pending' | 'active'
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  board: string
  class: string
  created_at: string
}

export interface ClassMember {
  class_id: string
  student_id: string
  joined_at: string
}

// ─── Subjects & Chapters ──────────────────────────────────────────────────

export interface Subject {
  id: string
  name: string
  board: string
  class: string
  color: string
  icon: string
}

export interface Chapter {
  id: string
  subject_id: string
  name: string
  weightage_pct: number
  order: number
}

// ─── Goals ────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'achieved' | 'abandoned'
export type Feasibility = 'feasible' | 'stretch' | 'unlikely'

export interface Goal {
  id: string
  student_id: string
  target_overall_pct: number
  created_at: string
  status: GoalStatus
}

export interface SubjectGoal {
  id: string
  goal_id: string
  subject_id: string
  target_pct: number
  required_effort_hrs: number
  ai_feasibility: Feasibility
  ai_rationale: string
}

// ─── Diagnostics & Mastery ────────────────────────────────────────────────

export type DiagnosticType = 'initial' | 'periodic' | 'chapter'
export type MasteryLabel = 'weakness' | 'neutral' | 'strength'

export interface Diagnostic {
  id: string
  student_id: string
  type: DiagnosticType
  started_at: string
  completed_at: string | null
  ability_estimate: number
}

export interface DiagnosticItem {
  id: string
  diagnostic_id: string
  chapter_id: string
  difficulty: number
  correct: boolean
  response_ms: number
}

export interface Mastery {
  student_id: string
  chapter_id: string
  mastery_pct: number
  confidence: number
  last_assessed: string
  label: MasteryLabel
}

// ─── Study Plans ──────────────────────────────────────────────────────────

export type TaskType = 'learn' | 'practice' | 'revise'
export type TaskStatus = 'pending' | 'done' | 'missed'

export interface StudyPlan {
  id: string
  student_id: string
  goal_id: string
  start_date: string
  end_date: string
  created_at: string
}

export interface PlanTask {
  id: string
  plan_id: string
  date: string
  subject_id: string
  chapter_id: string
  type: TaskType
  est_minutes: number
  status: TaskStatus
  rescheduled_from: string | null
}

// ─── Predictions ──────────────────────────────────────────────────────────

export type RiskLevel = 'on-track' | 'at-risk' | 'critical'

export interface Prediction {
  id: string
  student_id: string
  predicted_overall_pct: number
  confidence_pct: number
  per_subject: Record<string, { predicted: number; target: number }>
  risk_level: RiskLevel
  generated_at: string
}

// ─── Question Bank & Tests ────────────────────────────────────────────────

export interface Question {
  id: string
  subject_id: string
  chapter_id: string
  stem: string
  options: string[]
  answer: number
  difficulty: 1 | 2 | 3 | 4 | 5
  solution: string
  board_year: string | null
}

export interface PracticePaper {
  id: string
  subject_id: string
  name: string
  duration_min: number
  questions: string[]
}

export interface MockTest {
  id: string
  board: string
  class: string
  duration_min: number
  sections: Array<{ subject_id: string; questions: string[]; marks: number }>
}

export interface Attempt {
  id: string
  student_id: string
  test_id: string
  score: number
  percentile: number
  predicted_rank: number
  time_analysis: {
    sections: Array<{ subject_id: string; time_ms: number; correct: number; total: number }>
    total_ms: number
  }
  started_at: string
  submitted_at: string
}

export interface AttemptAnswer {
  attempt_id: string
  question_id: string
  chosen: number | null
  correct: boolean
  time_ms: number
}

// ─── AI Coach ─────────────────────────────────────────────────────────────

export interface CoachConversation {
  id: string
  student_id: string
  title: string
  created_at: string
}

export type MessageRole = 'user' | 'assistant'

export interface CoachMessage {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  created_at: string
}

// ─── Notes & Flashcards ───────────────────────────────────────────────────

export interface Note {
  id: string
  student_id: string
  chapter_id: string
  source: 'ai' | 'manual'
  content_md: string
  ai_generated: boolean
  created_at: string
}

export interface Flashcard {
  id: string
  student_id: string
  chapter_id: string
  front: string
  back: string
  srs_due: string
  srs_interval: number
  srs_ease: number
}

// ─── Gamification ─────────────────────────────────────────────────────────

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface XpEvent {
  id: string
  student_id: string
  amount: number
  reason: string
  created_at: string
}

export interface Achievement {
  id: string
  code: string
  title: string
  desc: string
  icon: string
  tier: AchievementTier
}

export interface StudentAchievement {
  student_id: string
  achievement_id: string
  earned_at: string
}

export interface Streak {
  student_id: string
  current: number
  longest: number
  last_active: string
}

export interface Challenge {
  id: string
  week_start: string
  title: string
  target_desc: string
  reward_xp: number
}

export interface ChallengeProgress {
  student_id: string
  challenge_id: string
  progress: number
  completed: boolean
}

export interface LeaderboardEntry {
  student_id: string
  full_name: string
  avatar_url: string | null
  total_xp: number
  rank: number
}

// ─── Focus & Burnout ──────────────────────────────────────────────────────

export type BurnoutLevel = 'ok' | 'watch' | 'high'
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading'

export interface FocusSession {
  id: string
  student_id: string
  started_at: string
  ended_at: string
  focus_score: number
  distractions: number
}

export interface ProductivityLog {
  student_id: string
  date: string
  minutes_studied: number
  tasks_done: number
}

export interface BurnoutSignal {
  id: string
  student_id: string
  date: string
  score: number
  factors: Record<string, number>
  level: BurnoutLevel
}

// ─── Notifications ────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

// ─── AI Service Types ─────────────────────────────────────────────────────

export interface GoalInput {
  targetPct: number
  subjects: Array<{ id: string; name: string; currentMastery: number }>
  examDate: string
  weeksRemaining: number
}

export interface GoalAnalysis {
  subjectBreakdowns: Array<{
    subjectId: string
    targetPct: number
    requiredEffortHrs: number
    feasibility: Feasibility
    rationale: string
  }>
  overallFeasibility: Feasibility
  totalWeeklyHrs: number
  summary: string
}

export interface DiagnosticState {
  abilityEstimate: number
  answered: Array<{ chapterId: string; difficulty: number; correct: boolean }>
  subjectId: string
}

export interface DiagnosticQuestion {
  chapterId: string
  difficulty: number
  stem: string
  options: string[]
  answer: number
  solution: string
}

export interface PlanInput {
  studentId: string
  goalId: string
  subjectGoals: SubjectGoal[]
  mastery: Mastery[]
  examDate: string
  startDate: string
  subjects: Subject[]
  chapters: Chapter[]
}

export interface PredictionInput {
  mastery: Mastery[]
  attempts: Attempt[]
  subjectGoals: SubjectGoal[]
  subjects: Subject[]
  daysRemaining: number
}

export interface ScorePrediction {
  predictedOverallPct: number
  confidencePct: number
  perSubject: Record<string, { predicted: number; target: number; gap: number }>
  riskLevel: RiskLevel
  reasoning: string
}

export interface Solution {
  steps: string[]
  finalAnswer: string
  chapterRef: string
  hint: string
}

export interface BurnoutInput {
  missedTasksLast7Days: number
  avgFocusScore: number
  avgStudyMinutesLast7Days: number
  lateNightSessionCount: number
  streakBroken: boolean
}

export interface BurnoutAssessment {
  level: BurnoutLevel
  score: number
  factors: Record<string, number>
  interventions: string[]
  message: string
}

export interface ProductivityInsight {
  weeklyMinutes: number
  trend: 'improving' | 'stable' | 'declining'
  bestDay: string
  suggestions: string[]
}

export interface StudentContext {
  profile: Profile
  goal: Goal | null
  subjectGoals: SubjectGoal[]
  mastery: Mastery[]
  streak: Streak | null
  recentTasks: PlanTask[]
  burnoutLevel: BurnoutLevel
}

export interface CohortContext {
  classId: string
  className: string
  studentCount: number
  atRiskCount: number
  avgPredictedScore: number
  weakestChapters: Array<{ chapterId: string; avgMastery: number }>
}

// ─── UI State Types ───────────────────────────────────────────────────────

export interface UIStore {
  theme: ThemePref
  setTheme: (t: ThemePref) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  devRole: UserRole
  setDevRole: (role: UserRole) => void
}
