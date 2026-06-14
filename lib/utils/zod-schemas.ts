import { z } from 'zod'

export const GoalInputSchema = z.object({
  targetPct: z.number().min(33).max(100),
  subjects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    currentMastery: z.number().min(0).max(100),
  })),
  examDate: z.string(),
  weeksRemaining: z.number().min(1).max(52),
})

export const GoalAnalysisSchema = z.object({
  subjectBreakdowns: z.array(z.object({
    subjectId: z.string(),
    targetPct: z.number(),
    requiredEffortHrs: z.number(),
    feasibility: z.enum(['feasible', 'stretch', 'unlikely']),
    rationale: z.string(),
  })),
  overallFeasibility: z.enum(['feasible', 'stretch', 'unlikely']),
  totalWeeklyHrs: z.number(),
  summary: z.string(),
})

export const ScorePredictionSchema = z.object({
  predictedOverallPct: z.number().min(0).max(100),
  confidencePct: z.number().min(0).max(100),
  perSubject: z.record(z.string(), z.object({
    predicted: z.number(),
    target: z.number(),
    gap: z.number(),
  })),
  riskLevel: z.enum(['on-track', 'at-risk', 'critical']),
  reasoning: z.string(),
})

export const SolutionSchema = z.object({
  steps: z.array(z.string()),
  finalAnswer: z.string(),
  chapterRef: z.string(),
  hint: z.string(),
})

export const FlashcardsSchema = z.array(z.object({
  front: z.string(),
  back: z.string(),
}))

export const BurnoutAssessmentSchema = z.object({
  level: z.enum(['ok', 'watch', 'high']),
  score: z.number().min(0).max(100),
  factors: z.record(z.string(), z.number()),
  interventions: z.array(z.string()),
  message: z.string(),
})

export const ProductivityInsightSchema = z.object({
  weeklyMinutes: z.number(),
  trend: z.enum(['improving', 'stable', 'declining']),
  bestDay: z.string(),
  suggestions: z.array(z.string()),
})

export const CoachMessageInputSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(4000),
})

export const DiagnosticAnswerSchema = z.object({
  diagnosticId: z.string(),
  chapterId: z.string(),
  difficulty: z.number(),
  correct: z.boolean(),
  responseMs: z.number(),
})
