import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAIService } from '@/lib/ai/factory'
import { differenceInWeeks } from 'date-fns'

const GoalRequestSchema = z.object({
  targetPct: z.number().min(33).max(100),
  examDate: z.string(),
  subjects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    currentMastery: z.number().min(0).max(100).default(50),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { targetPct, examDate, subjects } = GoalRequestSchema.parse(body)

    const weeksRemaining = Math.max(1, differenceInWeeks(new Date(examDate), new Date()))

    const ai = getAIService()
    const analysis = await ai.analyzeGoal({
      targetPct,
      subjects,
      examDate,
      weeksRemaining,
    })

    return NextResponse.json(analysis)
  } catch (e) {
    console.error('AI goals error:', e)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
