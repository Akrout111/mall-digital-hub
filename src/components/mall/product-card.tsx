'use client'

import { motion } from 'framer-motion'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMallStore } from '@/lib/store'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  cartQuantity?: number
  onAddToCart: () => void
  onRemoveFromCart: () => void
  onUpdateQuantity: (qty: number) => void
}

const productEmojis: Record<string, string> = {
  Fruits: '🍎',
  Vegetables: '🥬',
  Dairy: '🥛',
  Bakery: '🍞',
  Beverages: '🥤',
  Meat: '🥩',
  Snacks: '🍪',
  Household: '🧴',
}

export function ProductCard({
  product,
  cartQuantity = 0,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
}: ProductCardProps) {
  const language = useMallStore((s) => s.language)
  const isAr = language === 'ar'

  const name = isAr && product.nameAr ? product.nameAr : product.name
  const unitMap: Record<string, string> = {
    kg: isAr ? 'كجم' : 'kg',
    piece: isAr ? 'قطعة' : 'piece',
    liter: isAr ? 'لتر' : 'L',
    pack: isAr ? 'عبوة' : 'pack',
  }
  const unitLabel = unitMap[product.unit] || product.unit

  const categoryEmoji =
    product.category && product.category.name
      ? productEmojis[product.category.name] || '🛒'
      : '🛒'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-md ${
          !product.inStock ? 'opacity-60' : ''
        }`}
      >
        {/* Image / Emoji Placeholder */}
        <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl">{categoryEmoji}</span>
          )}

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                {isAr ? 'غير متوفر' : 'Out of Stock'}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Name */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>

          {/* Price & Unit */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-emerald-600">
              {product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              ر.س / {unitLabel}
            </span>
          </div>

          {/* Add to Cart / Quantity Controls */}
          {product.inStock ? (
            cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (cartQuantity === 1) {
                      onRemoveFromCart()
                    } else {
                      onUpdateQuantity(cartQuantity - 1)
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm min-w-[2rem] text-center">
                  {cartQuantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateQuantity(cartQuantity + 1)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart()
                }}
              >
                <ShoppingCart className="h-4 w-4 me-1.5" />
                {isAr ? 'أضف للسلة' : 'Add to Cart'}
              </Button>
            )
          ) : (
            <Button className="w-full" size="sm" variant="outline" disabled>
              {isAr ? 'غير متوفر' : 'Out of Stock'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
