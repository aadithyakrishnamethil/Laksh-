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
import { addDays, format } from 'date-fns'

const MOCK_QUESTIONS: DiagnosticQuestion[] = [
  {
    chapterId: 'phy-1',
    difficulty: 2,
    stem: 'Two point charges +3μC and -3μC are placed 20 cm apart. What is the electric field at the midpoint?',
    options: ['Zero', '2.7 × 10⁶ N/C', '5.4 × 10⁶ N/C', '1.35 × 10⁶ N/C'],
    answer: 2,
    solution: 'At the midpoint, fields from both charges point in the same direction (towards −q). E = 2 × kQ/r² = 5.4 × 10⁶ N/C.',
  },
  {
    chapterId: 'math-5',
    difficulty: 3,
    stem: 'If f(x) = x³ − 3x + 2, find the intervals in which f is increasing.',
    options: ['(−∞, −1) ∪ (1, ∞)', '(−1, 1)', '(0, ∞)', '(−∞, 0)'],
    answer: 0,
    solution: "f'(x) = 3x² − 3 = 3(x−1)(x+1). f is increasing where f'(x) > 0, i.e., x < −1 or x > 1.",
  },
  {
    chapterId: 'chem-3',
    difficulty: 2,
    stem: 'The standard EMF of the cell Zn|Zn²⁺||Cu²⁺|Cu is 1.10 V. If [Zn²⁺] = 0.1 M and [Cu²⁺] = 0.01 M at 298 K, what is the cell EMF?',
    options: ['1.04 V', '1.07 V', '1.10 V', '1.13 V'],
    answer: 1,
    solution: 'Use Nernst equation: E = E° − (0.059/n) log([Zn²⁺]/[Cu²⁺]) = 1.10 − 0.0295 × log(10) = 1.07 V.',
  },
  {
    chapterId: 'bio-5',
    difficulty: 3,
    stem: 'In a monohybrid cross between two heterozygous plants (Tt × Tt), what fraction of offspring will be homozygous recessive?',
    options: ['1/4', '1/2', '3/4', '1'],
    answer: 0,
    solution: 'Tt × Tt gives 1 TT : 2 Tt : 1 tt. So 1/4 of offspring are homozygous recessive (tt).',
  },
]

export class MockAIService implements AIService {
  async analyzeGoal(input: GoalInput): Promise<GoalAnalysis> {
    const breakdowns = input.subjects.map((sub) => {
      const gap = Math.max(0, input.targetPct - sub.currentMastery)
      const effortHrs = Math.round((gap / 100) * input.weeksRemaining * 2)
      const feasibility = gap < 20 ? 'feasible' : gap < 40 ? 'stretch' : 'unlikely'
      return {
        subjectId: sub.id,
        targetPct: input.targetPct,
        requiredEffortHrs: effortHrs,
        feasibility: feasibility as 'feasible' | 'stretch' | 'unlikely',
        rationale:
          feasibility === 'feasible'
            ? `Current mastery (${sub.currentMastery}%) is close to target. Consistent daily practice will get you there.`
            : feasibility === 'stretch'
            ? `There's a ${gap}% gap. You'll need focused daily sessions to close this gap before exams.`
            : `The ${gap}% gap requires intensive effort. Consider adjusting the target or prioritising high-weightage chapters.`,
      }
    })

    const avgFeasibility = breakdowns.filter((b) => b.feasibility === 'feasible').length
    const totalWeeklyHrs = breakdowns.reduce((s, b) => s + b.requiredEffortHrs / input.weeksRemaining, 0)

    return {
      subjectBreakdowns: breakdowns,
      overallFeasibility: avgFeasibility >= breakdowns.length * 0.7 ? 'feasible' : 'stretch',
      totalWeeklyHrs: Math.round(totalWeeklyHrs * 10) / 10,
      summary: `To achieve ${input.targetPct}%, you need approximately ${Math.round(totalWeeklyHrs)} hours/week across ${input.subjects.length} subjects over ${input.weeksRemaining} weeks.`,
    }
  }

  async nextDiagnosticItem(state: DiagnosticState): Promise<DiagnosticQuestion> {
    const idx = state.answered.length % MOCK_QUESTIONS.length
    return MOCK_QUESTIONS[idx]
  }

  async generatePlan(input: PlanInput): Promise<{ plan: Omit<StudyPlan, 'id' | 'created_at'>; tasks: Omit<PlanTask, 'id'>[] }> {
    const tasks: Omit<PlanTask, 'id'>[] = []
    const startDate = new Date(input.startDate)
    const endDate = new Date(input.examDate)
    const dayCount = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000)
    const subjectGoals = input.subjectGoals

    for (let d = 0; d < Math.min(dayCount, 90); d++) {
      const date = format(addDays(startDate, d), 'yyyy-MM-dd')
      const dayOfWeek = addDays(startDate, d).getDay()
      if (dayOfWeek === 0) continue // skip Sundays

      const subjectIdx = d % subjectGoals.length
      const sg = subjectGoals[subjectIdx]
      const subject = input.subjects.find((s) => s.id === sg.subject_id)
      if (!subject) continue

      // pick a chapter
      const chapters = input.chapters.filter((c) => c.subject_id === sg.subject_id)
      const chapter = chapters[d % chapters.length]
      if (!chapter) continue

      const type = d % 3 === 0 ? 'revise' : d % 5 === 0 ? 'practice' : 'learn'

      tasks.push({
        plan_id: '', // filled after plan creation
        date,
        subject_id: sg.subject_id,
        chapter_id: chapter.id,
        type: type as 'learn' | 'practice' | 'revise',
        est_minutes: type === 'practice' ? 45 : type === 'revise' ? 30 : 60,
        status: 'pending',
        rescheduled_from: null,
      })
    }

    return {
      plan: {
        student_id: input.studentId,
        goal_id: input.goalId,
        start_date: input.startDate,
        end_date: input.examDate,
      },
      tasks,
    }
  }

  async rescheduleMissedTasks(missed: PlanTask[], deadline: Date, allTasks: PlanTask[]): Promise<PlanTask[]> {
    const nextAvailableDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    return missed.map((t, i) => ({
      ...t,
      date: format(addDays(new Date(nextAvailableDate), i), 'yyyy-MM-dd'),
      status: 'pending' as const,
      rescheduled_from: t.date,
    }))
  }

  async predictScore(input: PredictionInput): Promise<ScorePrediction> {
    const perSubject: ScorePrediction['perSubject'] = {}
    let totalPredicted = 0
    let subjectCount = 0

    for (const sg of input.subjectGoals) {
      const subjectMastery = input.mastery.filter((m) => {
        // simplified: use average mastery across chapters
        return true
      })
      const avgMastery = subjectMastery.length
        ? subjectMastery.reduce((s, m) => s + m.mastery_pct, 0) / subjectMastery.length
        : 50

      // prediction: 0.85 * mastery + 0.1 * (days remaining factor)
      const daysBoost = Math.min(10, input.daysRemaining / 30) * 2
      const predicted = Math.min(100, Math.round(avgMastery * 0.85 + daysBoost))
      const gap = predicted - sg.target_pct

      perSubject[sg.subject_id] = { predicted, target: sg.target_pct, gap }
      totalPredicted += predicted
      subjectCount++
    }

    const predictedOverall = subjectCount ? Math.round(totalPredicted / subjectCount) : 60
    const atRiskCount = Object.values(perSubject).filter((s) => s.gap < -10).length

    return {
      predictedOverallPct: predictedOverall,
      confidencePct: 72,
      perSubject,
      riskLevel: atRiskCount >= 2 ? 'critical' : atRiskCount >= 1 ? 'at-risk' : 'on-track',
      reasoning: `Based on your current mastery levels and ${input.daysRemaining} days remaining, you're projected to score ${predictedOverall}%.`,
    }
  }

  coachChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, _context: StudentContext): ReadableStream {
    const lastMessage = messages[messages.length - 1]?.content ?? ''
    const responses = [
      `Great question! Here's how I'd approach this: Focus on understanding the concept first, then practice with examples. Your weak areas in the plan are great starting points. What specific topic would you like to dive into?`,
      `I can see you're working hard! Based on your study plan, I'd recommend focusing on the chapters marked as "weakness" first — they give you the biggest score boost. Want me to create a targeted revision list?`,
      `That's a common challenge. Let me break it down step by step. First, make sure you have the formula sheet ready. Then work through 5 practice problems daily. You'll see improvement in 2 weeks.`,
      `You're doing great! Your consistency is the key. Remember, ${lastMessage.length > 20 ? 'the concept you asked about' : 'each chapter'} builds on what you've already learned. Trust the process!`,
    ]
    const text = responses[Math.floor(Math.random() * responses.length)]

    return new ReadableStream({
      start(controller) {
        const words = text.split(' ')
        let i = 0
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(new TextEncoder().encode(words[i] + ' '))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 40)
      },
    })
  }

  async solveDoubt(question: string, _subjectId: string): Promise<Solution> {
    return {
      steps: [
        'Identify the key variables and what is being asked.',
        'Apply the relevant formula or concept from your syllabus.',
        'Substitute the known values carefully.',
        'Solve step by step, checking units at each step.',
        'Verify your answer makes physical/mathematical sense.',
      ],
      finalAnswer: 'The answer follows from applying the steps above systematically.',
      chapterRef: 'Chapter relevant to your question',
      hint: 'Remember to check the sign conventions and units before finalising your answer.',
    }
  }

  async generateNotes(chapterId: string, chapterName: string, subjectName: string): Promise<string> {
    return `# ${chapterName} — Revision Notes\n\n## Key Concepts\n\n1. **Core Principle**: The fundamental idea behind ${chapterName} involves understanding the relationship between related quantities.\n\n2. **Important Formulas**:\n   - Primary formula: F = ma (example)\n   - Secondary formula: E = mc² (example)\n\n## Detailed Notes\n\n### Section 1: Introduction\nThis chapter covers the essential aspects of ${chapterName} as per the CBSE ${subjectName} syllabus.\n\n### Section 2: Key Theorems\n- Theorem 1: States that...\n- Theorem 2: Proves that...\n\n### Section 3: Applications\nThese concepts are applied in:\n- Real-world scenario 1\n- Real-world scenario 2\n\n## Previous Year Questions\n1. (2023) Derive the expression for...\n2. (2022) Explain with examples...\n\n## Quick Revision Points\n- [ ] Understand the basic definition\n- [ ] Memorise key formulas\n- [ ] Practice numerical problems\n- [ ] Review board exam questions\n\n*AI-generated notes — verify with NCERT textbook*`
  }

  async generateFlashcards(_chapterId: string, chapterName: string, _subjectName: string): Promise<Omit<Flashcard, 'id' | 'student_id' | 'chapter_id' | 'srs_due' | 'srs_interval' | 'srs_ease'>[]> {
    return [
      { front: `What is the main concept of ${chapterName}?`, back: 'The main concept involves the interaction of fundamental quantities and their mathematical relationships.' },
      { front: `State the primary formula used in ${chapterName}`, back: 'The primary formula is derived from first principles and relates the key variables in the system.' },
      { front: `What are the SI units of the primary quantity in ${chapterName}?`, back: 'The SI unit is expressed in terms of base units (kg, m, s, A, K, mol, cd).' },
      { front: `Name two real-world applications of ${chapterName}`, back: '1. Technology application in modern devices\n2. Natural phenomenon that follows these principles' },
      { front: `What is the most common mistake in ${chapterName} problems?`, back: 'Forgetting to check sign conventions and units, and not verifying the answer against physical constraints.' },
    ]
  }

  async detectBurnout(signals: BurnoutInput): Promise<BurnoutAssessment> {
    const score = Math.min(100,
      signals.missedTasksLast7Days * 10 +
      (100 - signals.avgFocusScore) * 0.3 +
      signals.lateNightSessionCount * 15 +
      (signals.streakBroken ? 20 : 0)
    )
    const level = score > 70 ? 'high' : score > 40 ? 'watch' : 'ok'

    return {
      level: level as 'ok' | 'watch' | 'high',
      score,
      factors: {
        missed_tasks: signals.missedTasksLast7Days * 10,
        focus_quality: (100 - signals.avgFocusScore) * 0.3,
        late_nights: signals.lateNightSessionCount * 15,
        streak: signals.streakBroken ? 20 : 0,
      },
      interventions: level === 'high'
        ? ['Take a full rest day tomorrow', 'Sleep by 10 PM for the next 3 days', 'Reduce study hours by 30%', 'Do a 10-min meditation before studying']
        : level === 'watch'
        ? ['Take 5-min breaks every 45 minutes', 'Avoid studying past 11 PM', 'Complete just 2 tasks tomorrow instead of all']
        : ['You\'re doing great! Keep up the consistent pace.'],
      message: level === 'high'
        ? 'You\'re showing signs of burnout. Please rest — your performance will improve with recovery.'
        : level === 'watch'
        ? 'Mild fatigue detected. Small adjustments now will prevent burnout later.'
        : 'Your energy levels look healthy. Keep the momentum going!',
    }
  }

  async analyzeProductivity(logs: ProductivityLog[]): Promise<ProductivityInsight> {
    const weeklyMinutes = logs.slice(-7).reduce((s, l) => s + l.minutes_studied, 0)
    const prevWeekMinutes = logs.slice(-14, -7).reduce((s, l) => s + l.minutes_studied, 0)
    const trend = weeklyMinutes > prevWeekMinutes * 1.05 ? 'improving' : weeklyMinutes < prevWeekMinutes * 0.95 ? 'declining' : 'stable'

    const bestDay = logs.slice(-7).sort((a, b) => b.minutes_studied - a.minutes_studied)[0]?.date ?? 'Monday'

    return {
      weeklyMinutes,
      trend: trend as 'improving' | 'stable' | 'declining',
      bestDay,
      suggestions: [
        'Try the Pomodoro technique: 25 min study + 5 min break',
        'Schedule high-difficulty subjects in your peak energy hours',
        'Review yesterday\'s notes for 10 minutes before starting today',
      ],
    }
  }

  async generateWeeklyInsight(context: StudentContext): Promise<string> {
    const { profile, streak, burnoutLevel } = context
    const name = profile.full_name.split(' ')[0]
    return `**Week in Review for ${name}** 🎯\n\nYour consistency score this week is **great**! You maintained a ${streak?.current ?? 0}-day streak. Your strongest subject continues to be Mathematics, while Physics chapters 3-5 need more attention before the board exams. Based on your practice scores, you're on track for your target. Keep focusing on your weak chapters — just 20 min of targeted revision daily will make a big difference.${burnoutLevel !== 'ok' ? '\n\n⚠️ Remember to rest — your brain consolidates learning during sleep!' : ''}`
  }

  parentAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: StudentContext): ReadableStream {
    const name = context.profile.full_name.split(' ')[0]
    const response = `As ${name}'s AI assistant, I can share that they have been studying consistently this week. Their predicted score has improved by 3% since last assessment. The areas that need parental encouragement are Organic Chemistry and Integration. I'd suggest setting aside 30 minutes on weekends for a calm check-in — not about scores, but about how they're feeling. Is there anything specific you'd like to know about ${name}'s progress?`

    return new ReadableStream({
      start(controller) {
        const words = response.split(' ')
        let i = 0
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(new TextEncoder().encode(words[i] + ' '))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 35)
      },
    })
  }

  teacherAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: CohortContext): ReadableStream {
    const response = `Looking at ${context.className}, you have ${context.studentCount} students with ${context.atRiskCount} flagged as at-risk. The class average predicted score is ${context.avgPredictedScore}%. The weakest chapters across the cohort are ${context.weakestChapters.map(c => c.chapterId).join(', ')}. I recommend scheduling a targeted doubt-clearing session for these chapters. Would you like me to identify the specific students who need the most support?`

    return new ReadableStream({
      start(controller) {
        const words = response.split(' ')
        let i = 0
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(new TextEncoder().encode(words[i] + ' '))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 35)
      },
    })
  }
}
