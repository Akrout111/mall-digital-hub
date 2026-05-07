'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center" dir="rtl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">حدث خطأ غير متوقع</h2>
      <p className="text-muted-foreground max-w-md">
        نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          إعادة المحاولة
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          العودة للرئيسية
        </Button>
      </div>
    </div>
  )
}
