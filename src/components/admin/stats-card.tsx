import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'danger' | 'info'
  }
}

export function StatsCard({ title, value, icon, description, badge }: StatsCardProps) {
  const getBadgeClass = () => {
    if (!badge) return ''
    switch (badge.variant) {
      case 'success':
        return 'bg-[#10B981]/10 text-[#10B981]'
      case 'warning':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]'
      case 'danger':
        return 'bg-[#E63946]/10 text-[#E63946]'
      case 'info':
        return 'bg-[#3B82F6]/10 text-[#3B82F6]'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-default hover:shadow-elevated transition-all flex items-center justify-between">
      <div className="space-y-2">
        <span className="text-xs text-text-secondary uppercase font-semibold tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-secondary tracking-tight">
            {value}
          </span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeClass()}`}>
              {badge.text}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-text-secondary">
            {description}
          </p>
        )}
      </div>
      <div className="p-3 bg-surface rounded-lg text-secondary">
        {icon}
      </div>
    </div>
  )
}
