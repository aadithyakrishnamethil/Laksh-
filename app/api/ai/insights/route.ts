import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json()
    const ai = getAIService()

    if (type === 'productivity') {
      const insight = await ai.analyzeProductivity(data.logs ?? [])
      return NextResponse.json(insight)
    }

    if (type === 'weekly') {
      const insight = await ai.generateWeeklyInsight(data.context)
      return NextResponse.json({ insight })
    }

    return NextResponse.json({ error: 'Unknown insight type' }, { status: 400 })
  } catch (e) {
    console.error('Insights error:', e)
    return NextResponse.json({ error: 'Insights failed' }, { status: 500 })
  }
}
