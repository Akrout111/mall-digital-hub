'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: { value: number; positive: boolean }
  iconBgColor?: string
}

export function StatCard({ title, value, icon, description, trend, iconBgColor = 'bg-primary/10' }: StatCardProps) {
  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-start justify-between gap-3 px-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold leading-none">{value}</p>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.positive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>{trend.positive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
