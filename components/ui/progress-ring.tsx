'use client'

import { cn } from '@/lib/utils/cn'

interface ProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  status?: 'on-track' | 'at-risk' | 'critical' | 'default'
  className?: string
  children?: React.ReactNode
  animate?: boolean
}

const STATUS_COLORS = {
  'on-track': 'var(--accent-green)',
  'at-risk': 'var(--accent-orange)',
  critical: 'var(--accent-red)',
  default: 'var(--accent-blue)',
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  status = 'default',
  className,
  children,
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference
  const color = STATUS_COLORS[status]

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={animate ? { transition: 'stroke-dashoffset 0.8s ease-out' } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          <span className="text-[18px] font-semibold text-[var(--text-primary)]">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  )
}
