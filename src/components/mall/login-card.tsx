'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

interface LoginCardProps {
  title: string
  description: string
  children: React.ReactNode
  onLogin: () => void
  loginLabel?: string
  loginDisabled?: boolean
  icon?: React.ReactNode
}

export function LoginCard({
  title,
  description,
  children,
  onLogin,
  loginLabel = 'تسجيل الدخول',
  loginDisabled = false,
  icon,
}: LoginCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
        {/* Gradient Header */}
        <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-orange-600 px-6 py-8 text-center text-white">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            {icon || <Shield className="size-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-white/80 text-sm">{description}</p>
        </div>

        {/* Form Content */}
        <CardContent className="space-y-4 px-6 pt-6 pb-2">
          {children}
        </CardContent>

        {/* Login Button */}
        <div className="px-6 pb-6 pt-2">
          <Button
            onClick={onLogin}
            disabled={loginDisabled}
            className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
            size="lg"
          >
            {loginLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}
