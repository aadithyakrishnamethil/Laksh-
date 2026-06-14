'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, Plus, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { SEED_STUDENT, SEED_GOAL } from '@/lib/db/seed-data'

type Message = { role: 'user' | 'assistant'; content: string; id: string }

type Conversation = { id: string; title: string; messages: Message[] }

const SUGGESTIONS = [
  'How should I revise Ray Optics for boards?',
  'Give me a 30-min study plan for tonight',
  'I\'m feeling overwhelmed — what should I prioritise?',
  'Explain the difference between NPN and PNP transistors',
]

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

let msgId = 0
function uid() { return `m${++msgId}` }
let convId = 0
function cid() { return `c${++convId}` }

export default function CoachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: cid(), title: 'Physics Doubts', messages: [
      { id: uid(), role: 'assistant', content: 'Hi Anya! I\'m your AI learning coach. I know you\'re targeting **92% overall** in your CBSE boards. How can I help you today?' },
    ]},
  ])
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const active = conversations.find((c) => c.id === activeId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages])

  async function sendMessage(text: string = input) {
    const msg = text.trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg: Message = { id: uid(), role: 'user', content: msg }
    const assistantId = uid()

    setConversations((prev) =>
      prev.map((c) => c.id !== activeId ? c : {
        ...c,
        title: c.messages.length === 1 ? msg.slice(0, 40) : c.title,
        messages: [...c.messages, userMsg, { id: assistantId, role: 'assistant', content: '' }],
      })
    )
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...active.messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: {
            studentId: SEED_STUDENT.id,
            name: SEED_STUDENT.full_name,
            targetPct: SEED_GOAL.target_overall_pct,
            examDate: SEED_STUDENT.target_exam_date,
          },
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
        setConversations((prev) =>
          prev.map((c) => c.id !== activeId ? c : {
            ...c,
            messages: c.messages.map((m) => m.id === assistantId ? { ...m, content: snap } : m),
          })
        )
      }
    } catch {
      setConversations((prev) =>
        prev.map((c) => c.id !== activeId ? c : {
          ...c,
          messages: c.messages.map((m) => m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m),
        })
      )
    } finally {
      setStreaming(false)
    }
  }

  function newConversation() {
    const id = cid()
    setConversations((prev) => [...prev, {
      id,
      title: 'New chat',
      messages: [{ id: uid(), role: 'assistant', content: `Hi ${SEED_STUDENT.full_name}! What would you like to work on today?` }],
    }])
    setActiveId(id)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (activeId === id && next.length > 0) setActiveId(next[0].id)
      return next.length > 0 ? next : [{ id: cid(), title: 'New chat', messages: [{ id: uid(), role: 'assistant', content: 'How can I help you today?' }] }]
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col gap-2">
        <Button variant="secondary" onClick={newConversation} className="w-full justify-start gap-2">
          <Plus className="w-4 h-4" />
          New chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-lg)] cursor-pointer transition-all ${
                c.id === activeId ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]' : 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="flex-1 text-[13px] font-medium truncate">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-surface)] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">AI Learning Coach</h2>
            <p className="text-[12px] text-[var(--text-secondary)]">Context-aware · CBSE Class 12</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {active.messages.map((m, i) => {
              const isUser = m.role === 'user'
              const isLastMsg = i === active.messages.length - 1
              const isStreaming = streaming && isLastMsg && !isUser
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? 'bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF]' : 'bg-[var(--bg-subtle)]'}`}>
                    {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
                  </div>
                  <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block px-4 py-3 rounded-[var(--radius-xl)] text-[14px] leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] text-white rounded-tr-[6px]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-tl-[6px]'
                    }`}>
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
        {active.messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
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
        <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-end gap-3 bg-[var(--bg-subtle)] rounded-[var(--radius-xl)] px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach anything..."
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
          <p className="text-[11px] text-[var(--text-secondary)] mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
