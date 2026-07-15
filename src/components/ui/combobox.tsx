'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ComboboxProps {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string, label: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

export function Combobox({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = '-- Ketik atau pilih --',
  disabled = false,
  error,
  required = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync display text when value changes externally (e.g., reset)
  const selectedLabel = options.find(o => o.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) setQuery(selectedLabel)
  }, [open, selectedLabel])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query === '' || query === selectedLabel
    ? options.slice(0, 100)
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 100)

  const handleSelect = (opt: { value: string; label: string }) => {
    onChange(opt.value, opt.label)
    setQuery(opt.label)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange('', '')
  }

  const handleFocus = () => {
    setOpen(true)
    setQuery('')
    inputRef.current?.select()
  }

  return (
    <div className="mb-4" ref={containerRef}>
      <label htmlFor={id} className="block text-[14px] font-semibold text-text-primary mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={disabled ? 'Pilih opsi di atas dulu' : placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={`w-full px-3 pr-9 h-11 rounded-lg border text-sm bg-white text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
            error ? 'border-danger' : 'border-gray-300'
          }`}
        />
        {/* Chevron icon */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {/* Dropdown */}
        {open && !disabled && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto text-sm">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-text-secondary italic">Tidak ditemukan</li>
            ) : (
              filtered.map(opt => (
                <li
                  key={opt.value}
                  onMouseDown={() => handleSelect(opt)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors ${
                    opt.value === value ? 'bg-primary/10 text-primary font-semibold' : 'text-text-primary'
                  } ${opt.value === '' ? 'text-gray-400 italic' : ''}`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
