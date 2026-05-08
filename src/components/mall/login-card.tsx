'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Loader2, AlertCircle } from 'lucide-react'

interface LoginCardProps {
  title: string
  description: string
  role: 'admin' | 'merchant'
  onLogin: () => void
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function LoginCard({
  title,
  description,
  role,
  onLogin,
  icon,
  children,
}: LoginCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : result.error)
      } else if (result?.ok) {
        onLogin()
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول')
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6 pt-6 pb-2">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor={`${role}-email`}>البريد الإلكتروني</Label>
              <Input
                id={`${role}-email`}
                type="email"
                placeholder="admin@grandmall.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor={`${role}-password`}>كلمة المرور</Label>
              <Input
                id={`${role}-password`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Children slot (for merchant shop selection etc.) */}
            {children}
          </CardContent>

          {/* Login Button */}
          <div className="px-6 pb-6 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
