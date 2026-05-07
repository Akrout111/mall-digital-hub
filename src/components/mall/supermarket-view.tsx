'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Check, X, ChefHat } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useMallStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { CartSheet } from './cart-sheet'
import { FloatingCartButton } from './floating-cart-button'
import type { Product, ProductCategory, Shop } from '@/lib/types'

export function SupermarketView() {
  const language = useMallStore((s) => s.language)
  const cart = useMallStore((s) => s.cart)
  const cartShopId = useMallStore((s) => s.cartShopId)
  const addToCart = useMallStore((s) => s.addToCart)
  const removeFromCart = useMallStore((s) => s.removeFromCart)
  const updateCartQuantity = useMallStore((s) => s.updateCartQuantity)
  const clearCart = useMallStore((s) => s.clearCart)
  const isAr = language === 'ar'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [shopId, setShopId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  // Fetch supermarket shop and customer
  useEffect(() => {
    fetch('/api/shops?category=supermarket')
      .then((r) => r.json())
      .then((shops: Shop[]) => {
        if (shops.length > 0) {
          const freshMarket = shops.find((s) => s.name === 'Fresh Market') || shops[0]
          setShop(freshMarket)
          setShopId(freshMarket.id)
        }
      })

    // Fetch customer user for order placement
    fetch('/api/mall')
      .then((r) => r.json())
      .then(() => {
        // Use the seeded customer - we'll fetch via a simple approach
        // In a real app this would come from auth context
        fetch('/api/orders?status=pending')
          .then((r) => r.json())
          .then((orders: { customerId: string }[]) => {
            if (orders.length > 0) {
              setCustomerId(orders[0].customerId)
            }
          })
          .catch(() => {})
      })
  }, [])

  // Fetch products & categories
  useEffect(() => {
    if (!shopId) return
    Promise.all([
      fetch(`/api/products?shopId=${shopId}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([prods, cats]) => {
      setProducts(prods)
      // Filter categories that have products in this shop
      const shopCategoryIds = new Set(prods.map((p: Product) => p.categoryId))
      const relevantCats = cats.filter((c: ProductCategory) => shopCategoryIds.has(c.id))
      setCategories(relevantCats)
      setLoading(false)
    })
  }, [shopId])

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products
    if (activeCategory) {
      result = result.filter((p) => p.categoryId === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameAr && p.nameAr.includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }
    return result
  }, [products, activeCategory, searchQuery])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr || undefined,
      price: product.price,
      quantity: 1,
      image: product.image || undefined,
      unit: product.unit,
      shopId: product.shopId,
    })
  }

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return
    setOrderSubmitting(true)

    try {
      // Use the customer user ID from the seed (we'll use a default one)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || 'guest',
          shopId: cartShopId || shopId,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          notes: orderNotes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()
      setOrderId(order.id)
      setOrderSuccess(true)
      clearCart()
      setOrderNotes('')
    } catch (error) {
      console.error('Order error:', error)
    } finally {
      setOrderSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setOrderSuccess(false)
    setConfirmOpen(false)
    setCartOpen(false)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-24 animate-pulse bg-muted rounded-xl" />
        <div className="h-10 animate-pulse bg-muted rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse bg-muted rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-emerald-500 to-teal-600 rounded-xl p-5 text-white"
      >
        <h1 className="text-2xl font-bold">🛒 {isAr ? 'اطلب واستلم' : 'Click & Collect'}</h1>
        <p className="text-emerald-100 text-sm mt-1">
          {isAr
            ? 'اطلب المنتجات أونلاين واستلمها من المتجر بسهولة'
            : 'Order products online and collect them from the store easily'}
        </p>
        {shop && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {isAr && shop.nameAr ? shop.nameAr : shop.name}
            </Badge>
            {shop.isOpen && (
              <Badge variant="secondary" className="bg-emerald-400/30 text-white border-0">
                {isAr ? 'مفتوح الآن' : 'Open Now'}
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9"
        />
      </div>

      {/* Category Tabs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-1">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            className="rounded-full px-4"
            onClick={() => setActiveCategory(null)}
          >
            {isAr ? 'الكل' : 'All'}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full px-4"
              onClick={() => setActiveCategory(cat.id)}
            >
              {isAr && cat.nameAr ? cat.nameAr : cat.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const cartItem = cart.find((c) => c.productId === product.id)
            return (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartItem?.quantity || 0}
                onAddToCart={() => handleAddToCart(product)}
                onRemoveFromCart={() => removeFromCart(product.id)}
                onUpdateQuantity={(qty) => updateCartQuantity(product.id, qty)}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl">
            🔍
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            {isAr ? 'لا توجد منتجات' : 'No products found'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
          </p>
        </div>
      )}

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setCartOpen(true)} />

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onConfirmOrder={() => {
          setCartOpen(false)
          setConfirmOpen(true)
        }}
      />

      {/* Order Confirmation Dialog */}
      <Dialog open={confirmOpen && !orderSuccess} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
            </DialogTitle>
            <DialogDescription className="text-right">
              {isAr ? 'راجع طلبك قبل التأكيد' : 'Review your order before confirming'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="truncate ms-2">
                    {isAr && item.nameAr ? item.nameAr : item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {(item.price * item.quantity).toFixed(2)} ر.س
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{isAr ? 'المجموع' : 'Total'}</span>
                <span className="text-emerald-600">{cartTotal.toFixed(2)} ر.س</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-right">
                {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
              </label>
              <Textarea
                placeholder={isAr ? 'أي طلبات خاصة...' : 'Any special requests...'}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="text-right"
                rows={2}
              />
            </div>

            {/* Pickup Info */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 flex items-start gap-2">
              <ChefHat className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  {isAr ? 'جاهز للاستلام' : 'Ready for Pickup'}
                </p>
                <p className="text-amber-600 dark:text-amber-500 text-xs mt-0.5">
                  {isAr
                    ? 'سيتم تحضير طلبك وإشعارك عندما يكون جاهزاً للاستلام من المتجر'
                    : 'Your order will be prepared and you will be notified when ready for pickup'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              <X className="h-4 w-4 me-1.5" />
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={orderSubmitting || cart.length === 0}
            >
              {orderSubmitting ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  <Check className="h-4 w-4 me-1.5" />
                  {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={handleCloseSuccess}>
        <DialogContent className="sm:max-w-sm text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center py-4"
          >
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-bold mb-1">
              {isAr ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-4">
              {isAr ? 'طلبك قيد التحضير' : 'Your order is being prepared'}
            </DialogDescription>

            <div className="bg-muted/50 rounded-lg p-4 w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? 'رقم الطلب' : 'Order #'}</span>
                <span className="font-mono font-bold">{orderId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? 'الحالة' : 'Status'}</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {isAr ? 'قيد التحضير' : 'Preparing'}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              {isAr
                ? 'سنقوم بإشعارك عندما يكون طلبك جاهزاً للاستلام'
                : 'We will notify you when your order is ready for pickup'}
            </p>

            <Button className="w-full mt-4" onClick={handleCloseSuccess}>
              <ShoppingCart className="h-4 w-4 me-1.5" />
              {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
