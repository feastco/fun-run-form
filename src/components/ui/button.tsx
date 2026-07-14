import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'default' | 'compact'
  isLoading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({
  className,
  variant = 'primary',
  size = 'default',
  isLoading,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-default transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover active:bg-primary/95',
        variant === 'secondary' && 'bg-transparent border border-primary text-primary hover:bg-primary/10',
        variant === 'danger' && 'bg-danger text-white hover:bg-danger/90',
        variant === 'ghost' && 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary',
        size === 'default' && 'h-[44px] px-6 text-[16px]',
        size === 'compact' && 'h-[36px] px-4 text-[14px]',
        (disabled || isLoading) && 'bg-[#E5E7EB] text-[#9CA3AF] border-none cursor-not-allowed active:scale-100',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
