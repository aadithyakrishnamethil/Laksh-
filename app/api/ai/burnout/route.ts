import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const signals = await req.json()
    const ai = getAIService()
    const assessment = await ai.detectBurnout(signals)
    return NextResponse.json(assessment)
  } catch (e) {
    console.error('Burnout detection error:', e)
    return NextResponse.json({ error: 'Burnout detection failed' }, { status: 500 })
  }
}
