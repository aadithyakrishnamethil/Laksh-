import type {
  GoalInput,
  GoalAnalysis,
  DiagnosticState,
  DiagnosticQuestion,
  PlanInput,
  PredictionInput,
  ScorePrediction,
  Solution,
  Flashcard,
  BurnoutInput,
  BurnoutAssessment,
  ProductivityLog,
  ProductivityInsight,
  StudentContext,
  CohortContext,
  PlanTask,
  StudyPlan,
} from '@/types'

export interface AIService {
  // Goal Setting
  analyzeGoal(input: GoalInput): Promise<GoalAnalysis>

  // Diagnostics
  nextDiagnosticItem(state: DiagnosticState): Promise<DiagnosticQuestion>

  // Study Planning
  generatePlan(input: PlanInput): Promise<{ plan: Omit<StudyPlan, 'id' | 'created_at'>; tasks: Omit<PlanTask, 'id'>[] }>
  rescheduleMissedTasks(missed: PlanTask[], deadline: Date, allTasks: PlanTask[]): Promise<PlanTask[]>

  // Score Prediction
  predictScore(input: PredictionInput): Promise<ScorePrediction>

  // Coach (streaming)
  coachChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context?: StudentContext): ReadableStream

  // Doubt Solver
  solveDoubt(question: string, subjectId: string): Promise<Solution>

  // Content Generation
  generateNotes(chapterId: string, chapterName: string, subjectName: string): Promise<string>
  generateFlashcards(chapterId: string, chapterName: string, subjectName: string): Promise<Omit<Flashcard, 'id' | 'student_id' | 'chapter_id' | 'srs_due' | 'srs_interval' | 'srs_ease'>[]>

  // Insights
  detectBurnout(signals: BurnoutInput): Promise<BurnoutAssessment>
  analyzeProductivity(logs: ProductivityLog[]): Promise<ProductivityInsight>
  generateWeeklyInsight(context: StudentContext): Promise<string>

  // Parent / Teacher Assistants (streaming)
  parentAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, studentContext: StudentContext): ReadableStream
  teacherAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, cohortContext: CohortContext): ReadableStream
}
