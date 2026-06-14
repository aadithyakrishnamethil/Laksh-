'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Message = { role: 'user' | 'assistant'; content: string; id: string }

let _id = 0
const uid = () => `am${++_id}`

interface AssistantPanelProps {
  endpoint: string
  context: unknown
  title: string
  subtitle: string
  greeting: string
  suggestions: string[]
  /** Tailwind height utility for the panel, e.g. 'h-[560px]'. */
  heightClass?: string
}

function StreamingDot() {
  return (
    <span className="inline-flex gap-1 items-end h-4 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-current opacity-60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

export function AssistantPanel({
  endpoint,
  context,
  title,
  subtitle,
  greeting,
  suggestions,
  heightClass = 'h-[560px]',
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: 'assistant', content: greeting },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string = input) {
    const msg = text.trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg: Message = { id: uid(), role: 'user', content: msg }
    const assistantId = uid()
    const history = [...messages, userMsg]

    setMessages([...history, { id: assistantId, role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const snap = accumulated
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: snap } : m))
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      )
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      className={`flex flex-col bg-[var(--bg-surface)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)] ${heightClass}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="text-[12px] text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            const isLastMsg = i === messages.length - 1
            const isStreaming = streaming && isLastMsg && !isUser
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    isUser
                      ? 'bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF]'
                      : 'bg-[var(--bg-subtle)]'
                  }`}
                >
                  {isUser ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  )}
                </div>
                <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-[var(--radius-xl)] text-[14px] leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] text-white rounded-tr-[6px]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-tl-[6px]'
                    }`}
                  >
                    {m.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : isStreaming ? (
                      <StreamingDot />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-[12px] text-[var(--accent-blue)] bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-4 border-t border-[var(--border-subtle)] shrink-0">
        <div className="flex items-end gap-3 bg-[var(--bg-subtle)] rounded-[var(--radius-xl)] px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] max-h-32 overflow-y-auto"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
