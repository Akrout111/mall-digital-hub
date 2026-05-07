'use client'

import { useState } from 'react'
import { useMallStore } from '@/lib/store'
import type { View } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Home,
  BookOpen,
  Flame,
  ShoppingCart,
  Map,
  Menu,
  Globe,
  Store,
  Shield,
} from 'lucide-react'

interface NavItem {
  view: View
  labelAr: string
  labelEn: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { view: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Home className="h-4 w-4" /> },
  { view: 'directory', labelAr: 'الدليل', labelEn: 'Directory', icon: <BookOpen className="h-4 w-4" /> },
  { view: 'deals', labelAr: 'العروض', labelEn: 'Deals', icon: <Flame className="h-4 w-4" /> },
  { view: 'supermarket', labelAr: 'السوبرماركت', labelEn: 'Supermarket', icon: <ShoppingCart className="h-4 w-4" /> },
  { view: 'map', labelAr: 'الخريطة', labelEn: 'Map', icon: <Map className="h-4 w-4" /> },
]

export function Navbar() {
  const { currentView, setView, language, setLanguage } = useMallStore()
  const isAr = language === 'ar'
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (view: View) => {
    setView(view)
    setMobileOpen(false)
  }

  const toggleLanguage = () => {
    setLanguage(isAr ? 'en' : 'ar')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo & Name - Right side in RTL */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">
              {isAr ? 'جراند مول' : 'Grand Mall'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {isAr ? 'المنصة الرقمية' : 'Digital Hub'}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? 'default' : 'ghost'}
              size="sm"
              className={`gap-1.5 text-xs ${
                currentView === item.view
                  ? ''
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleNavClick(item.view)}
            >
              {item.icon}
              {isAr ? item.labelAr : item.labelEn}
            </Button>
          ))}
        </nav>

        {/* Right Actions - Left side in RTL */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={toggleLanguage}
          >
            <Globe className="h-3.5 w-3.5" />
            {isAr ? 'EN' : 'عربي'}
          </Button>

          {/* Merchant Portal - Desktop Only */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-1.5 text-xs"
            onClick={() => handleNavClick('merchant')}
          >
            <Store className="h-3.5 w-3.5" />
            {isAr ? 'بوابة التاجر' : 'Merchant'}
          </Button>

          {/* Admin Dashboard - Desktop Only */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-1.5 text-xs"
            onClick={() => handleNavClick('admin')}
          >
            <Shield className="h-3.5 w-3.5" />
            {isAr ? 'الإدارة' : 'Admin'}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">
                  {isAr ? 'القائمة' : 'Menu'}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side={isAr ? 'right' : 'left'} className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  {isAr ? 'جراند مول' : 'Grand Mall'}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.view}>
                    <Button
                      variant={currentView === item.view ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavClick(item.view)}
                    >
                      {item.icon}
                      {isAr ? item.labelAr : item.labelEn}
                    </Button>
                  </SheetClose>
                ))}

                <Separator className="my-2" />

                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavClick('merchant')}
                  >
                    <Store className="h-4 w-4" />
                    {isAr ? 'بوابة التاجر' : 'Merchant Portal'}
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavClick('admin')}
                  >
                    <Shield className="h-4 w-4" />
                    {isAr ? 'لوحة الإدارة' : 'Admin Dashboard'}
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
