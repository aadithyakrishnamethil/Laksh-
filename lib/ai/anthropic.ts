import Anthropic from '@anthropic-ai/sdk'
import type { AIService } from './service'
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
import {
  GoalAnalysisSchema,
  ScorePredictionSchema,
  SolutionSchema,
  FlashcardsSchema,
  BurnoutAssessmentSchema,
  ProductivityInsightSchema,
} from '@/lib/utils/zod-schemas'
import { MockAIService } from './mock'

const MODEL = 'claude-sonnet-4-6'

async function callClaude(
  client: Anthropic,
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt + '\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanation.',
    messages: [{ role: 'user', content: userPrompt }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text)
}

function makeStream(client: Anthropic, systemPrompt: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens = 1024): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.create({
          model: MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
          stream: true,
        })
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
          }
        }
        controller.close()
      } catch (e) {
        controller.error(e)
      }
    },
  })
}

export class AnthropicAIService implements AIService {
  private client: Anthropic
  private mock: MockAIService

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    this.mock = new MockAIService()
  }

  async analyzeGoal(input: GoalInput): Promise<GoalAnalysis> {
    const system = `You are Laksh, an AI study coach for CBSE Class 12 students in India.
Analyse the student's target score and current mastery to create a realistic per-subject goal breakdown.`
    const user = `Student wants to score ${input.targetPct}% in CBSE Class 12 board exams in ${input.weeksRemaining} weeks.
Current subject mastery: ${JSON.stringify(input.subjects)}
Return JSON: { subjectBreakdowns: [{ subjectId, targetPct, requiredEffortHrs, feasibility: "feasible"|"stretch"|"unlikely", rationale }], overallFeasibility, totalWeeklyHrs, summary }`
    const raw = await callClaude(this.client, system, user)
    return GoalAnalysisSchema.parse(raw) as GoalAnalysis
  }

  async nextDiagnosticItem(state: DiagnosticState): Promise<DiagnosticQuestion> {
    return this.mock.nextDiagnosticItem(state)
  }

  async generatePlan(input: PlanInput) {
    return this.mock.generatePlan(input)
  }

  async rescheduleMissedTasks(missed: PlanTask[], deadline: Date, allTasks: PlanTask[]): Promise<PlanTask[]> {
    return this.mock.rescheduleMissedTasks(missed, deadline, allTasks)
  }

  async predictScore(input: PredictionInput): Promise<ScorePrediction> {
    const system = `You are a score prediction engine for CBSE Class 12 board exams. Analyse mastery data and predict realistic board exam scores.`
    const user = `Student data:
- Days until exam: ${input.daysRemaining}
- Subject goals: ${JSON.stringify(input.subjectGoals)}
- Mastery per chapter (sample): ${JSON.stringify(input.mastery.slice(0, 20))}
Return JSON: { predictedOverallPct: number, confidencePct: number, perSubject: { "<subjectId>": { predicted: number, target: number, gap: number } }, riskLevel: "on-track"|"at-risk"|"critical", reasoning: string }`
    const raw = await callClaude(this.client, system, user)
    return ScorePredictionSchema.parse(raw) as ScorePrediction
  }

  coachChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context?: StudentContext): ReadableStream {
    const name = context?.profile?.full_name ?? 'Student'
    const target = context?.goal?.target_overall_pct ?? 90
    const weakChapters = context?.mastery?.filter(m => m.label === 'weakness').map(m => m.chapter_id).slice(0, 5).join(', ') ?? ''
    const streak = context?.streak?.current ?? 0
    const burnout = context?.burnoutLevel ?? 'ok'
    const systemPrompt = `You are Laksh AI Coach, a supportive study companion for ${name}, a CBSE Class 12 student aiming for ${target}%.
${weakChapters ? `Weak chapters: ${weakChapters}.` : ''}
Streak: ${streak} days. Burnout level: ${burnout}.
Be encouraging, precise, and India-exam-specific. Use markdown for formatting.`
    return makeStream(this.client, systemPrompt, messages, 1024)
  }

  async solveDoubt(question: string, subjectId: string): Promise<Solution> {
    const system = `You are a CBSE Class 12 subject expert. Solve the student's doubt with clear, step-by-step reasoning.`
    const user = `Subject: ${subjectId}\nQuestion: ${question}
Return JSON: { steps: string[], finalAnswer: string, chapterRef: string, hint: string }`
    const raw = await callClaude(this.client, system, user)
    return SolutionSchema.parse(raw) as Solution
  }

  async generateNotes(_chapterId: string, chapterName: string, subjectName: string): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: `You are a CBSE Class 12 expert. Generate comprehensive, exam-focused revision notes in Markdown.`,
      messages: [{
        role: 'user',
        content: `Generate detailed revision notes for CBSE Class 12 ${subjectName}: Chapter "${chapterName}".
Include: key concepts, important formulas, derivations outline, common exam questions, quick revision checklist.`,
      }],
    })
    return response.content[0].type === 'text' ? response.content[0].text : ''
  }

  async generateFlashcards(_chapterId: string, chapterName: string, subjectName: string): Promise<Omit<Flashcard, 'id' | 'student_id' | 'chapter_id' | 'srs_due' | 'srs_interval' | 'srs_ease'>[]> {
    const system = `Generate spaced-repetition flashcards for CBSE Class 12 exam preparation.`
    const user = `Create 10 flashcards for ${subjectName}: "${chapterName}".
Return JSON array: [{ "front": "question", "back": "answer" }]`
    const raw = await callClaude(this.client, system, user)
    return FlashcardsSchema.parse(raw) as Omit<Flashcard, 'id' | 'student_id' | 'chapter_id' | 'srs_due' | 'srs_interval' | 'srs_ease'>[]
  }

  async detectBurnout(signals: BurnoutInput): Promise<BurnoutAssessment> {
    const system = `You are a student wellbeing AI. Detect burnout risk compassionately and suggest healthy interventions.`
    const user = `Student signals: ${JSON.stringify(signals)}
Return JSON: { "level": "ok"|"watch"|"high", "score": 0-100, "factors": { "key": score }, "interventions": string[], "message": string }`
    const raw = await callClaude(this.client, system, user)
    return BurnoutAssessmentSchema.parse(raw) as BurnoutAssessment
  }

  async analyzeProductivity(logs: ProductivityLog[]): Promise<ProductivityInsight> {
    const system = `Analyse student productivity patterns and provide actionable suggestions.`
    const user = `Study logs (last 14 days): ${JSON.stringify(logs)}
Return JSON: { "weeklyMinutes": number, "trend": "improving"|"stable"|"declining", "bestDay": string, "suggestions": string[] }`
    const raw = await callClaude(this.client, system, user)
    return ProductivityInsightSchema.parse(raw) as ProductivityInsight
  }

  async generateWeeklyInsight(context: StudentContext): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: `Generate a brief, personalised, motivating weekly insight for a CBSE Class 12 student. Be specific, warm, and actionable. Return plain text, no JSON.`,
      messages: [{
        role: 'user',
        content: `Student: ${context.profile.full_name}, streak: ${context.streak?.current ?? 0} days, burnout: ${context.burnoutLevel}, target: ${context.goal?.target_overall_pct ?? 90}%. Summarise their week and give one key action.`,
      }],
    })
    return response.content[0].type === 'text' ? response.content[0].text : ''
  }

  parentAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: StudentContext): ReadableStream {
    const systemPrompt = `You are a caring parent assistant helping ${context.profile.full_name}'s parents understand their child's CBSE Class 12 exam preparation.
Be warm, reassuring, and translate academic data into plain language. Never be alarmist.
Key facts: target ${context.goal?.target_overall_pct ?? 'not set'}%, streak ${context.streak?.current ?? 0} days, burnout ${context.burnoutLevel}.`
    return makeStream(this.client, systemPrompt, messages, 512)
  }

  teacherAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: CohortContext): ReadableStream {
    const systemPrompt = `You are a teacher assistant for ${context.className}.
Class has ${context.studentCount} students, ${context.atRiskCount} at risk, avg predicted score ${context.avgPredictedScore}%.
Help the teacher with cohort insights, intervention strategies, and identifying struggling students.`
    return makeStream(this.client, systemPrompt, messages, 512)
  }
}
