'use client'

import { Shop } from '@/lib/types'
import { useMallStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Star, Store } from 'lucide-react'
import { motion } from 'framer-motion'

interface ShopCardProps {
  shop: Shop
  onClick?: () => void
}

export function ShopCard({ shop, onClick }: ShopCardProps) {
  const { language } = useMallStore()
  const isAr = language === 'ar'

  const name = isAr && shop.nameAr ? shop.nameAr : shop.name
  const categoryName = isAr && shop.category?.nameAr ? shop.category.nameAr : shop.category?.name || ''
  const isPremium = shop.subscriptionTier === 'premium'

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer overflow-hidden transition-colors hover:bg-accent/50 ${
          isPremium ? 'border-amber-300 dark:border-amber-600' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Shop Logo/Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                isPremium
                  ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40'
                  : 'bg-muted'
              }`}
            >
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <Store
                  className={`h-6 w-6 ${
                    isPremium ? 'text-amber-600' : 'text-muted-foreground'
                  }`}
                />
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-sm">{name}</h3>
                {isPremium && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {categoryName && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: shop.category?.color
                        ? `${shop.category.color}20`
                        : undefined,
                      color: shop.category?.color || undefined,
                      borderColor: shop.category?.color
                        ? `${shop.category.color}40`
                        : undefined,
                    }}
                  >
                    {categoryName}
                  </Badge>
                )}

                {/* Open/Closed Status */}
                <div className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      shop.isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground">
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

              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {isAr ? 'طابق' : 'Floor'} {shop.floor} • {shop.shopNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {shop.openTime} - {shop.closeTime}
                </span>
              </div>

              {/* Tags */}
              {shop.tags && shop.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {shop.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-muted px-1.5 py-0 text-[9px] text-muted-foreground"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {shop.tags.length > 3 && (
                    <span className="rounded-full bg-muted px-1.5 py-0 text-[9px] text-muted-foreground">
                      +{shop.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
