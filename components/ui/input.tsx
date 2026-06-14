import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            'rounded-[var(--radius-md)] px-4 py-3 text-[14px]',
            'border-0 outline-none transition-all duration-200 ease-out',
            'focus:bg-[var(--bg-surface)] focus:shadow-[0_0_0_2px_var(--accent-blue)]',
            error && 'shadow-[0_0_0_2px_var(--accent-red)]',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[12px] text-[var(--accent-red)]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
