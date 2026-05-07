'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMallStore } from '@/lib/store'
import { CartSheet } from '@/components/mall/cart-sheet'

export function FloatingCartButton() {
  const cart = useMallStore((s) => s.cart)
  const currentView = useMallStore((s) => s.currentView)
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Only show when in supermarket view and cart has items
  if (currentView !== 'supermarket' || itemCount === 0) {
    return <CartSheet open={cartOpen} onOpenChange={setCartOpen} onConfirmOrder={() => setCartOpen(false)} />
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 start-4 z-40"
        >
          <Button
            onClick={() => setCartOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 relative"
            aria-label={itemCount === 1 ? 'عنصر واحد في السلة' : `${itemCount} عناصر في السلة`}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -end-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </Button>
        </motion.div>
      </AnimatePresence>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} onConfirmOrder={() => setCartOpen(false)} />
    </>
  )
}
