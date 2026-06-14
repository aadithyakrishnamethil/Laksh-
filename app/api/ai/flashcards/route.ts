import { NextRequest, NextResponse } from 'next/server'
import { getAIService } from '@/lib/ai/factory'

export async function POST(req: NextRequest) {
  try {
    const { chapterId, chapterName, subjectName } = await req.json()
    if (!chapterId || !chapterName) {
      return NextResponse.json({ error: 'chapterId and chapterName required' }, { status: 400 })
    }
    const ai = getAIService()
    const cards = await ai.generateFlashcards(chapterId, chapterName, subjectName ?? 'Unknown Subject')
    return NextResponse.json({ flashcards: cards })
  } catch (e) {
    console.error('Flashcards generation error:', e)
    return NextResponse.json({ error: 'Flashcard generation failed' }, { status: 500 })
  }
}
