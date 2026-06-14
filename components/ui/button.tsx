import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)] disabled:opacity-40 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-[#2A7AFE] to-[#53C8FF] text-white',
          'hover:from-[#1a6aee] hover:to-[#43b8ef] hover:scale-[0.98]',
          'active:scale-[0.96]',
          'rounded-[100px]',
        ],
        secondary: [
          'bg-[var(--bg-subtle)] text-[var(--text-primary)]',
          'hover:bg-[var(--border-subtle)] hover:scale-[0.98]',
          'rounded-[100px]',
        ],
        outline: [
          'border border-[var(--accent-blue)] text-[var(--accent-blue)] bg-transparent',
          'hover:bg-[var(--accent-blue)] hover:text-white hover:scale-[0.98]',
          'rounded-[100px]',
        ],
        ghost: [
          'text-[var(--text-primary)] bg-transparent',
          'hover:bg-[var(--bg-subtle)]',
          'rounded-[var(--radius-md)]',
        ],
        text: [
          'text-[var(--accent-blue)] bg-transparent font-[500]',
          'hover:opacity-70',
          'rounded-[var(--radius-sm)]',
        ],
        danger: [
          'bg-[var(--accent-red)] text-white',
          'hover:opacity-85 hover:scale-[0.98]',
          'rounded-[100px]',
        ],
      },
      size: {
        sm: 'h-8 px-4 text-[13px]',
        md: 'h-10 px-5 text-[14px]',
        lg: 'h-12 px-7 text-[16px]',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
