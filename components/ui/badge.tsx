import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-[12px] font-medium tracking-wide px-3 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-subtle)] text-[var(--text-primary)]',
        blue: 'bg-blue-50 text-[var(--accent-blue)] dark:bg-blue-950/50',
        green: 'bg-green-50 text-[var(--accent-green)] dark:bg-green-950/50',
        orange: 'bg-orange-50 text-[var(--accent-orange)] dark:bg-orange-950/50',
        red: 'bg-red-50 text-[var(--accent-red)] dark:bg-red-950/50',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50',
        bronze: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50',
        silver: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
        gold: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50',
        platinum: 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 dark:from-purple-950/50 dark:to-blue-950/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
