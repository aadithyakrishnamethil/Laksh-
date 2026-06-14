import type { AIService } from './service'
import { MockAIService } from './mock'

let _service: AIService | undefined

export function getAIService(): AIService {
  if (_service) return _service

  const provider = process.env.AI_PROVIDER ?? 'mock'

  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    // Lazy import to avoid loading Anthropic SDK when using mock
    const { AnthropicAIService } = require('./anthropic')
    _service = new AnthropicAIService() as AIService
  } else {
    _service = new MockAIService()
  }

  return _service
}
