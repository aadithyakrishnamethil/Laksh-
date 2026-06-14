import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'
import { differenceInDays } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mastery = [], attempts = [], subjectGoals = [], subjects = [], examDate } = body

    const daysRemaining = examDate
      ? Math.max(0, differenceInDays(new Date(examDate), new Date()))
      : 180

    const ai = getAIService()
    const prediction = await ai.predictScore({ mastery, attempts, subjectGoals, subjects, daysRemaining })

    return NextResponse.json(prediction)
  } catch (e) {
    console.error('AI predict error:', e)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}
