'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AICopilotOrb() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnreadReply, setHasUnreadReply] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
    // Opening the panel clears any unread indicator
    if (open) setHasUnreadReply(false)
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hi! I\'m your AI study coach. Ask me anything about your CBSE Class 12 subjects, revision strategies, or how to improve your score. 🎯',
      }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      if (!res.ok || !res.body) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t connect right now. Try again in a moment.' }])
        return
      }
      // Stream the plain-text response chunk by chunk
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
      setLoading(false)
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: reply }
          return updated
        })
      }
      // If the reply finished while the panel was closed, flag it as unread
      if (!openRef.current) setHasUnreadReply(true)
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-80 flex flex-col bg-[var(--bg-surface)] rounded-[20px] shadow-2xl border border-[var(--border-subtle)] overflow-hidden"
            style={{ height: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[#2A7AFE]/5 to-[#53C8FF]/5 shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">AI Coach</p>
                <p className="text-[11px] text-[var(--text-secondary)]">CBSE Class 12 assistant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-blue)] text-white rounded-br-[4px]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-bl-[4px]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-subtle)] rounded-[14px] rounded-bl-[4px] px-3.5 py-2.5">
                    <Loader2 className="w-4 h-4 text-[var(--text-secondary)] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-[var(--border-subtle)] shrink-0">
              <div className="flex items-end gap-2 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask anything…"
                  rows={1}
                  className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none outline-none max-h-24"
                  style={{ lineHeight: '1.5' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The orb */}
      <motion.button
        onClick={() => setOpen(!open)}
        aria-label="Open AI Coach"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-full flex items-center justify-center"
        style={{ isolation: 'isolate' }}
      >
        {/* Rotating gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #2A7AFE, #53C8FF, #34C759, #FF9F0A, #2A7AFE)',
            padding: '2.5px',
          }}
          animate={{ rotate: open ? 0 : 360 }}
          transition={open ? {} : { duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        {/* White background disc */}
        <div className="absolute inset-[2.5px] rounded-full bg-white dark:bg-gray-900 shadow" />
        {/* Icon */}
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative z-10"
        >
          {open ? (
            <X className="w-5 h-5 text-[var(--accent-blue)]" />
          ) : (
            <Sparkles className="w-5 h-5 text-[var(--accent-blue)]" />
          )}
        </motion.div>
        {/* Unread dot only when an AI reply arrived while the panel was closed */}
        {!open && hasUnreadReply && (
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[var(--accent-green)] rounded-full border-2 border-white" />
        )}
      </motion.button>
    </div>
  )
}
