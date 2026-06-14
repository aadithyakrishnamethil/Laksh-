import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const { question, subjectId } = await req.json()
    if (!question || !subjectId) {
      return NextResponse.json({ error: 'question and subjectId required' }, { status: 400 })
    }
    const ai = getAIService()
    const solution = await ai.solveDoubt(question, subjectId)
    return NextResponse.json(solution)
  } catch (e) {
    console.error('Doubt solver error:', e)
    return NextResponse.json({ error: 'Solver failed' }, { status: 500 })
  }
}
