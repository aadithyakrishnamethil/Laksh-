'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [role, setRole] = useState<'student' | 'parent' | 'teacher'>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
      if (error) throw error
      router.refresh()
      router.push('/onboarding')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'student', label: '🎓 Student', desc: 'I\'m preparing for boards' },
    { value: 'parent', label: '👪 Parent', desc: 'I\'m monitoring my child' },
    { value: 'teacher', label: '📚 Teacher', desc: 'I\'m managing a class' },
  ] as const

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">Laksh</span>
        </Link>

        <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
          Create your account
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mb-8">
          Start your AI-powered CBSE exam prep journey today.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role selection */}
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-3 rounded-[var(--radius-lg)] text-center transition-all duration-200 ${
                  role === r.value
                    ? 'bg-blue-50 border-2 border-[var(--accent-blue)] dark:bg-blue-950/30'
                    : 'bg-[var(--bg-subtle)] border-2 border-transparent hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-[18px] mb-1">{r.label.split(' ')[0]}</div>
                <div className={`text-[11px] font-medium ${role === r.value ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'}`}>
                  {r.label.split(' ').slice(1).join(' ')}
                </div>
              </button>
            ))}
          </div>

          <Input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-[13px] text-[var(--accent-red)] bg-red-50 dark:bg-red-950/30 rounded-[var(--radius-md)] px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center mt-6 text-[14px] text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent-blue)] font-medium hover:opacity-70 transition-opacity">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
