'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    // Dev shortcut: skip auth and go to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">Laksh</span>
          </Link>

          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8">
            Sign in to continue your CBSE Class 12 journey.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
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
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-app)] px-3 text-[12px] text-[var(--text-tertiary)]">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleDemoLogin}
          >
            Continue as Demo Student
          </Button>

          <p className="text-center mt-6 text-[14px] text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--accent-blue)] font-medium hover:opacity-70 transition-opacity">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2A7AFE]/5 to-[#53C8FF]/10 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md text-center"
        >
          <div className="text-[72px] mb-6">🎯</div>
          <h2 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight mb-4">
            Ace your CBSE boards with AI
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed">
            Personalised study plans, adaptive diagnostics, and an AI coach that knows exactly where you need help.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Students', value: '12,000+' },
              { label: 'Avg Score Boost', value: '+18%' },
              { label: 'Chapters Covered', value: '70+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-white/5 rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-card)]">
                <div className="text-[22px] font-bold text-[var(--accent-blue)]">{stat.value}</div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
