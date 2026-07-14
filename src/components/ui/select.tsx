import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  ref?: React.Ref<HTMLSelectElement>
  options: { value: string; label: string }[]
}

export function Select({
  className,
  label,
  error,
  helperText,
  id,
  options,
  ref,
  ...props
}: SelectProps) {
  return (
    <div className="w-full flex flex-col mb-4">
      {label && (
        <label htmlFor={id} className="font-medium text-[14px] text-[#374151] mb-[4px]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full border border-[#D1D5DB] rounded-default h-[44px] px-3 bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder-[#9CA3AF] cursor-pointer',
          error && 'border-danger ring-2 ring-danger/30 focus:border-danger focus:ring-danger/30',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-[12px] text-danger mt-[4px]">{error}</p>
      ) : (
        helperText && <p className="text-[12px] text-text-secondary mt-[4px]">{helperText}</p>
      )}
    </div>
  )
}
