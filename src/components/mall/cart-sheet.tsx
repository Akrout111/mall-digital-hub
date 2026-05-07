'use client'

import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMallStore } from '@/lib/store'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmOrder: () => void
}

export function CartSheet({ open, onOpenChange, onConfirmOrder }: CartSheetProps) {
  const language = useMallStore((s) => s.language)
  const cart = useMallStore((s) => s.cart)
  const removeFromCart = useMallStore((s) => s.removeFromCart)
  const updateCartQuantity = useMallStore((s) => s.updateCartQuantity)
  const clearCart = useMallStore((s) => s.clearCart)
  const isAr = language === 'ar'

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-right flex items-center gap-2 justify-end">
            <ShoppingCart className="h-5 w-5" />
            {isAr ? 'سلة التسوق' : 'Shopping Cart'}
            {itemCount > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-right">
            {isAr ? 'منتجاتك الجاهزة للاستلام' : 'Your items ready for pickup'}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {isAr ? 'السلة فارغة' : 'Cart is empty'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'أضف منتجات للبدء' : 'Add products to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-2">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {/* Product Image/Emoji */}
                    <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center shrink-0 text-xl">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={isAr && item.nameAr ? item.nameAr : item.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        '🛒'
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {isAr && item.nameAr ? item.nameAr : item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.price.toFixed(2)} ر.س × {item.quantity} ={' '}
                        <span className="font-semibold text-foreground">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeFromCart(item.productId)
                            } else {
                              updateCartQuantity(item.productId, item.quantity - 1)
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 ms-auto"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Footer */}
            <SheetFooter className="gap-2">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isAr ? 'المجموع' : 'Total'}
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {total.toFixed(2)} ر.س
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={onConfirmOrder}>
                  {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-500 hover:text-red-600"
                  size="sm"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 me-1.5" />
                  {isAr ? 'تفريغ السلة' : 'Clear Cart'}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
