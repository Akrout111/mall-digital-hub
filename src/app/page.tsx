'use client'

import dynamic from 'next/dynamic'
import { useMallStore } from '@/lib/store'
import { Navbar } from '@/components/mall/navbar'
import { HomeView } from '@/components/mall/home-view'
import { ErrorBoundary } from '@/components/mall/error-boundary'
import { SkipToContent } from '@/components/mall/skip-to-content'

const DirectoryView = dynamic(() => import('@/components/mall/directory-view').then(m => ({ default: m.DirectoryView })), { ssr: false })
const DealsView = dynamic(() => import('@/components/mall/deals-view').then(m => ({ default: m.DealsView })), { ssr: false })
const SupermarketView = dynamic(() => import('@/components/mall/supermarket-view').then(m => ({ default: m.SupermarketView })), { ssr: false })
const MapView = dynamic(() => import('@/components/mall/map-view').then(m => ({ default: m.MapView })), { ssr: false })
const MerchantView = dynamic(() => import('@/components/mall/merchant-view').then(m => ({ default: m.MerchantView })), { ssr: false })
const AdminView = dynamic(() => import('@/components/mall/admin-view').then(m => ({ default: m.AdminView })), { ssr: false })
const FloatingCartButton = dynamic(() => import('@/components/mall/floating-cart-button').then(m => ({ default: m.FloatingCartButton })), { ssr: false })

export default function Home() {
  const { currentView, language } = useMallStore()
  const isAr = language === 'ar'

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isAr ? 'rtl' : 'ltr'}>
      <SkipToContent />
      <Navbar />
      <main className="flex-1" id="main-content" role="main">
        {currentView === 'home' && <ErrorBoundary><HomeView /></ErrorBoundary>}
        {currentView === 'directory' && <ErrorBoundary><DirectoryView /></ErrorBoundary>}
        {currentView === 'deals' && <ErrorBoundary><DealsView /></ErrorBoundary>}
        {currentView === 'supermarket' && <ErrorBoundary><SupermarketView /></ErrorBoundary>}
        {currentView === 'map' && <ErrorBoundary><MapView /></ErrorBoundary>}
        {currentView === 'merchant' && <ErrorBoundary><MerchantView /></ErrorBoundary>}
        {currentView === 'admin' && <ErrorBoundary><AdminView /></ErrorBoundary>}
      </main>
      <footer className="mt-auto border-t bg-card py-4 text-center text-sm text-muted-foreground">
        © 2024 {isAr ? 'جراند مول' : 'Grand Mall'} - {isAr ? 'المنصة الرقمية المتكاملة' : 'Digital Hub Platform'}
      </footer>
      <FloatingCartButton />
    </div>
  )
}
