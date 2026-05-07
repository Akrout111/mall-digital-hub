'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Store, Clock, ChevronLeft, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useMallStore } from '@/lib/store'
import type { Shop, ShopCategory } from '@/lib/types'

// Category colors mapping
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  Fashion: { bg: 'bg-rose-100 dark:bg-rose-950/40', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-300' },
  Electronics: { bg: 'bg-sky-100 dark:bg-sky-950/40', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-300' },
  Restaurants: { bg: 'bg-orange-100 dark:bg-orange-950/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
  Entertainment: { bg: 'bg-purple-100 dark:bg-purple-950/40', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300' },
  Supermarket: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300' },
  Beauty: { bg: 'bg-pink-100 dark:bg-pink-950/40', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-300' },
  Sports: { bg: 'bg-amber-100 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' },
  Home: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-700 dark:text-cyan-300' },
}

const defaultColor = { bg: 'bg-gray-100 dark:bg-gray-950/40', border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300' }

export function MapView() {
  const language = useMallStore((s) => s.language)
  const setSelectedShop = useMallStore((s) => s.setSelectedShop)
  const setView = useMallStore((s) => s.setView)
  const isAr = language === 'ar'

  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFloor, setSelectedFloor] = useState('1')
  const [highlightedShopId, setHighlightedShopId] = useState<string | null>(null)
  const [selectedShop, setSelectedShopLocal] = useState<Shop | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/shops').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([allShops, cats]) => {
      setShops(allShops)
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  const floorShops = shops.filter((s) => s.floor === parseInt(selectedFloor))

  const handleShopClick = (shop: Shop) => {
    setSelectedShopLocal(shop)
    setHighlightedShopId(shop.id)
    setDialogOpen(true)
  }

  const handleVisitShop = (shopId: string) => {
    setSelectedShop(shopId)
    setView('merchant')
    setDialogOpen(false)
  }

  // Create grid layout for the map
  const getGridPosition = (index: number, total: number) => {
    const cols = total <= 4 ? 2 : total <= 6 ? 3 : 4
    const row = Math.floor(index / cols) + 1
    const col = (index % cols) + 1
    return { row, col }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 w-64 animate-pulse bg-muted rounded-lg" />
        <div className="h-96 animate-pulse bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-red-500" />
          {isAr ? 'خريطة المول' : 'Mall Map'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr ? 'استكشف المحلات في كل طابق' : 'Explore shops on each floor'}
        </p>
      </motion.div>

      {/* Floor Selector */}
      <Tabs value={selectedFloor} onValueChange={setSelectedFloor}>
        <TabsList className="w-full">
          <TabsTrigger value="1" className="flex-1">
            {isAr ? 'الطابق ١' : 'Floor 1'}
          </TabsTrigger>
          <TabsTrigger value="2" className="flex-1">
            {isAr ? 'الطابق ٢' : 'Floor 2'}
          </TabsTrigger>
          <TabsTrigger value="3" className="flex-1">
            {isAr ? 'الطابق ٣' : 'Floor 3'}
          </TabsTrigger>
        </TabsList>

        {[1, 2, 3].map((floor) => (
          <TabsContent key={floor} value={String(floor)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Visual Map */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {isAr ? `الطابق ${floor === 1 ? '١' : floor === 2 ? '٢' : '٣'}` : `Floor ${floor}`}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {floorShops.length} {isAr ? 'محل' : 'shops'}
                      </Badge>
                    </div>

                    {/* Floor Plan Grid */}
                    <div
                      className="relative bg-muted/30 rounded-xl border-2 border-dashed border-muted p-4 min-h-[300px]"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${floorShops.length <= 4 ? 2 : floorShops.length <= 6 ? 3 : 4}, 1fr)`,
                        gap: '12px',
                        alignItems: 'stretch',
                      }}
                    >
                      {/* Entrance indicator */}
                      <div
                        className="absolute bottom-0 start-1/2 -translate-x-1/2 translate-y-1/2 bg-foreground text-background text-xs px-3 py-1 rounded-full z-10"
                      >
                        {isAr ? 'مدخل' : 'Entrance'}
                      </div>

                      {floorShops.map((shop, index) => {
                        const catName = shop.category?.name || ''
                        const colors = categoryColors[catName] || defaultColor
                        const isHighlighted = highlightedShopId === shop.id

                        return (
                          <motion.button
                            key={shop.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              scale: isHighlighted ? 1.05 : 1,
                            }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleShopClick(shop)}
                            className={`relative rounded-lg border-2 p-3 text-center transition-all cursor-pointer hover:shadow-md ${colors.bg} ${isHighlighted ? `${colors.border} ring-2 ring-offset-2 ring-amber-400` : colors.border}`}
                          >
                            {/* Shop Number */}
                            <div className={`text-xs font-mono ${colors.text} mb-1`}>
                              {shop.shopNumber}
                            </div>

                            {/* Shop Name */}
                            <div className="text-xs font-semibold truncate leading-tight">
                              {isAr && shop.nameAr ? shop.nameAr : shop.name}
                            </div>

                            {/* Open/Closed Dot */}
                            <div className="mt-1.5 flex justify-center">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  shop.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shop List Sidebar */}
              <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3">
                      {isAr ? 'قائمة المحلات' : 'Shop List'}
                    </h3>

                    <ScrollArea className="h-[300px] lg:h-[360px]">
                      <div className="space-y-2">
                        {floorShops.map((shop) => {
                          const catName = shop.category?.name || ''
                          const colors = categoryColors[catName] || defaultColor
                          const isHighlighted = highlightedShopId === shop.id

                          return (
                            <motion.button
                              key={shop.id}
                              whileHover={{ x: -4 }}
                              onClick={() => {
                                setHighlightedShopId(shop.id)
                                handleShopClick(shop)
                              }}
                              className={`w-full text-right p-2.5 rounded-lg border transition-all cursor-pointer ${
                                isHighlighted
                                  ? `${colors.bg} ${colors.border} border-2`
                                  : 'border-transparent hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${colors.bg} ${colors.text}`}
                                >
                                  {shop.shopNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {isAr && shop.nameAr ? shop.nameAr : shop.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 ${colors.text} ${colors.border}`}
                                    >
                                      {isAr && shop.category?.nameAr ? shop.category.nameAr : shop.category?.name}
                                    </Badge>
                                    <span
                                      className={`text-[10px] ${
                                        shop.isOpen ? 'text-emerald-600' : 'text-red-500'
                                      }`}
                                    >
                                      {shop.isOpen
                                        ? isAr
                                          ? 'مفتوح'
                                          : 'Open'
                                        : isAr
                                          ? 'مغلق'
                                          : 'Closed'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">
            {isAr ? 'دليل الألوان' : 'Color Legend'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const colors = categoryColors[cat.name] || defaultColor
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${colors.bg} ${colors.text} ${colors.border} border`}
                >
                  <div className={`h-2.5 w-2.5 rounded-sm ${colors.text} opacity-60`} />
                  {isAr && cat.nameAr ? cat.nameAr : cat.name}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shop Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedShop && (
            <>
              <DialogHeader>
                <DialogTitle className="text-right">
                  {isAr && selectedShop.nameAr ? selectedShop.nameAr : selectedShop.name}
                </DialogTitle>
                <DialogDescription className="text-right">
                  {isAr && selectedShop.descriptionAr
                    ? selectedShop.descriptionAr
                    : selectedShop.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* Shop Info */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {isAr ? 'رقم المحل' : 'Shop Number'}
                      </span>
                    </div>
                    <Badge variant="outline">{selectedShop.shopNumber}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {isAr ? 'الطابق' : 'Floor'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {selectedShop.floor}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {isAr ? 'ساعات العمل' : 'Hours'}
                      </span>
                    </div>
                    <Badge
                      variant={selectedShop.isOpen ? 'default' : 'destructive'}
                      className={selectedShop.isOpen ? 'bg-emerald-600' : ''}
                    >
                      {selectedShop.isOpen
                        ? isAr
                          ? 'مفتوح'
                          : 'Open'
                        : isAr
                          ? 'مغلق'
                          : 'Closed'}{' '}
                      ({selectedShop.openTime} - {selectedShop.closeTime})
                    </Badge>
                  </div>
                </div>

                {/* Category Badge */}
                {selectedShop.category && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isAr ? 'التصنيف' : 'Category'}:
                    </span>
                    <Badge
                      variant="outline"
                      className={`${
                        categoryColors[selectedShop.category.name]?.text || ''
                      } ${categoryColors[selectedShop.category.name]?.border || ''}`}
                    >
                      {isAr && selectedShop.category.nameAr
                        ? selectedShop.category.nameAr
                        : selectedShop.category.name}
                    </Badge>
                  </div>
                )}

                {/* Contact */}
                <div className="flex gap-2 text-sm text-muted-foreground">
                  {selectedShop.phone && <span dir="ltr">{selectedShop.phone}</span>}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleVisitShop(selectedShop.id)}
                >
                  <Store className="h-4 w-4 me-1.5" />
                  {isAr ? 'زيارة المحل' : 'Visit Shop'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
