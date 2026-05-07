'use client'

import { useMallStore } from '@/lib/store'

export function SkipToContent() {
  const { language } = useMallStore()
  const isAr = language === 'ar'

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
    >
      {isAr ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
    </a>
  )
}
