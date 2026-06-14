import { NextRequest } from 'next/server'
import { getAIService } from '@/lib/ai/factory'
import type { CohortContext } from '@/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages = [], context } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      context: CohortContext
    }

    const ai = getAIService()
    const stream = ai.teacherAssistant(messages, context)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e) {
    console.error('Teacher assistant error:', e)
    return new Response('Assistant unavailable', { status: 500 })
  }
}
