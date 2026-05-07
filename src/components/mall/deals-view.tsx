'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMallStore } from '@/lib/store'
import { DealCard } from './deal-card'
import type { Deal, ShopCategory } from '@/lib/types'

export function DealsView() {
  const language = useMallStore((s) => s.language)
  const selectedCategory = useMallStore((s) => s.selectedCategory)
  const setSelectedCategory = useMallStore((s) => s.setSelectedCategory)
  const isAr = language === 'ar'

  const [deals, setDeals] = useState<Deal[]>([])
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/deals').then((r) => r.json()),
      fetch('/api/deals?featured=true').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([allDeals, featDeals, cats]) => {
      setDeals(allDeals)
      setFeaturedDeals(featDeals)
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setActiveCategory(selectedCategory)
  }, [selectedCategory])

  const filteredDeals = activeCategory
    ? deals.filter((d) => d.shop?.id && d.shop?.categoryId === activeCategory || false)
    : deals

  const filteredFeatured = activeCategory
    ? featuredDeals.filter((d) => d.shop?.id && d.shop?.categoryId === activeCategory || false)
    : featuredDeals

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 w-48 animate-pulse bg-muted rounded-lg" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-56 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold">
          🔥{' '}
          <span className="bg-gradient-to-l from-red-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            {isAr ? 'عروض ساخنة' : 'Hot Deals'}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'أفضل العروض والخصومات في المول' : 'Best deals and discounts at the mall'}
        </p>
      </motion.div>

      {/* Category Filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            className="rounded-full px-4"
            onClick={() => {
              setActiveCategory(null)
              setSelectedCategory(null)
            }}
          >
            {isAr ? 'الكل' : 'All'}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full px-4"
              onClick={() => {
                setActiveCategory(cat.id)
                setSelectedCategory(cat.id)
              }}
            >
              {isAr && cat.nameAr ? cat.nameAr : cat.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Featured Deals Carousel */}
      {filteredFeatured.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⭐ {isAr ? 'عروض مميزة' : 'Featured Deals'}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const el = document.getElementById('featured-scroll')
                  if (el) el.scrollBy({ left: isAr ? 300 : -300, behavior: 'smooth' })
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const el = document.getElementById('featured-scroll')
                  if (el) el.scrollBy({ left: isAr ? -300 : 300, behavior: 'smooth' })
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea id="featured-scroll" className="w-full">
            <div className="flex gap-4 pb-2" dir="ltr">
              {filteredFeatured.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-w-[280px] sm:min-w-[320px]"
                >
                  <DealCard deal={deal} featured />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* All Deals Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-500" />
          {isAr ? 'جميع العروض' : 'All Deals'}
          <Badge variant="secondary" className="text-xs">
            {filteredDeals.length}
          </Badge>
        </h2>

        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Tag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              {isAr ? 'لا توجد عروض حالياً' : 'No deals available'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? 'ترقبوا العروض القادمة!'
                : 'Stay tuned for upcoming deals!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
