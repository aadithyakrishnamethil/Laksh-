import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const { chapterId, chapterName, subjectName } = await req.json()
    if (!chapterId || !chapterName) {
      return NextResponse.json({ error: 'chapterId and chapterName required' }, { status: 400 })
    }
    const ai = getAIService()
    const notes = await ai.generateNotes(chapterId, chapterName, subjectName ?? 'Unknown Subject')
    return NextResponse.json({ content_md: notes })
  } catch (e) {
    console.error('Notes generation error:', e)
    return NextResponse.json({ error: 'Notes generation failed' }, { status: 500 })
  }
}
