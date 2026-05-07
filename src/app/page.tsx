'use client'

import dynamic from 'next/dynamic'
import { useMallStore } from '@/lib/store'
import { Navbar } from '@/components/mall/navbar'
import { HomeView } from '@/components/mall/home-view'

const DirectoryView = dynamic(() => import('@/components/mall/directory-view').then(m => ({ default: m.DirectoryView })), { ssr: false })
const DealsView = dynamic(() => import('@/components/mall/deals-view').then(m => ({ default: m.DealsView })), { ssr: false })
const SupermarketView = dynamic(() => import('@/components/mall/supermarket-view').then(m => ({ default: m.SupermarketView })), { ssr: false })
const MapView = dynamic(() => import('@/components/mall/map-view').then(m => ({ default: m.MapView })), { ssr: false })
const MerchantView = dynamic(() => import('@/components/mall/merchant-view').then(m => ({ default: m.MerchantView })), { ssr: false })
const AdminView = dynamic(() => import('@/components/mall/admin-view').then(m => ({ default: m.AdminView })), { ssr: false })
const FloatingCartButton = dynamic(() => import('@/components/mall/floating-cart-button').then(m => ({ default: m.FloatingCartButton })), { ssr: false })
const CartSheet = dynamic(() => import('@/components/mall/cart-sheet').then(m => ({ default: m.CartSheet })), { ssr: false })

export default function Home() {
  const { currentView, language } = useMallStore()
  const isAr = language === 'ar'

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isAr ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'directory' && <DirectoryView />}
        {currentView === 'deals' && <DealsView />}
        {currentView === 'supermarket' && <SupermarketView />}
        {currentView === 'map' && <MapView />}
        {currentView === 'merchant' && <MerchantView />}
        {currentView === 'admin' && <AdminView />}
      </main>
      <footer className="mt-auto border-t bg-card py-4 text-center text-sm text-muted-foreground">
        © 2024 {isAr ? 'جراند مول' : 'Grand Mall'} - {isAr ? 'المنصة الرقمية المتكاملة' : 'Digital Hub Platform'}
      </footer>
      <FloatingCartButton />
      <CartSheet />
    </div>
  )
}
