'use client'

import { useState, useEffect, useRef } from 'react'
import { Shop, Deal } from '@/lib/types'
import { useMallStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { InquiryDialog } from '@/components/mall/inquiry-dialog'
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Tag,
  Star,
  Store,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react'

interface ShopDetailDialogProps {
  shop: Shop | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShopDetailDialog({
  shop,
  open,
  onOpenChange,
}: ShopDetailDialogProps) {
  const { language } = useMallStore()
  const isAr = language === 'ar'
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [shopDetail, setShopDetail] = useState<Shop | null>(null)
  const [shopDeals, setShopDeals] = useState<Deal[]>([])
  const fetchingRef = useRef<string | null>(null)

  // Reset state when dialog closes
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShopDetail(null)
      setShopDeals([])
      fetchingRef.current = null
    }
    onOpenChange(nextOpen)
  }

  // Fetch shop details when shop changes while dialog is open
  // Using requestAnimationFrame to avoid synchronous setState in effect
  useEffect(() => {
    if (!open || !shop) return
    if (fetchingRef.current === shop.id) return
    fetchingRef.current = shop.id

    const shopId = shop.id

    // Track visit (fire-and-forget)
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType: 'shop', entityId: shopId }),
    }).catch(() => {})

    // Fetch full shop details
    let cancelled = false
    fetch(`/api/shops/${shopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && !data.error) {
          setShopDetail(data)
          setShopDeals(data.deals || [])
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [open, shop])

  if (!shop) return null

  const displayShop = shopDetail || shop
  const shopName = isAr && displayShop.nameAr ? displayShop.nameAr : displayShop.name
  const description =
    isAr && displayShop.descriptionAr
      ? displayShop.descriptionAr
      : displayShop.description
  const categoryName =
    isAr && displayShop.category?.nameAr
      ? displayShop.category.nameAr
      : displayShop.category?.name || ''
  const isPremium = displayShop.subscriptionTier === 'premium'

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {/* Cover Image */}
          <div className="relative -mx-6 -mt-6 h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            {displayShop.coverImage ? (
              <img
                src={displayShop.coverImage}
                alt={shopName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Store className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            {isPremium && (
              <Badge className="absolute top-3 end-3 gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                <Star className="h-3 w-3 fill-white" />
                {isAr ? 'مميز' : 'Premium'}
              </Badge>
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {shopName}
              {categoryName && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: displayShop.category?.color
                      ? `${displayShop.category.color}20`
                      : undefined,
                    color: displayShop.category?.color || undefined,
                  }}
                >
                  {categoryName}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Shop Info */}
          <div className="flex flex-col gap-3">
            {/* Open/Closed Status */}
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  displayShop.isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                {displayShop.isOpen
                  ? isAr
                    ? 'مفتوح الآن'
                    : 'Open Now'
                  : isAr
                    ? 'مغلق'
                    : 'Closed'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {isAr ? 'طابق' : 'Floor'} {displayShop.floor} •{' '}
                  {displayShop.shopNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {displayShop.openTime} - {displayShop.closeTime}
                </span>
              </div>
              {displayShop.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span dir="ltr">{displayShop.phone}</span>
                </div>
              )}
              {displayShop.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate" dir="ltr">{displayShop.email}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {displayShop.tags && displayShop.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayShop.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag.tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Current Deals */}
          {shopDeals.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="flex items-center gap-2 font-semibold text-sm">
                <ShoppingBag className="h-4 w-4" />
                {isAr ? 'العروض الحالية' : 'Current Deals'}
              </h4>
              <div className="flex flex-col gap-2">
                {shopDeals.map((deal) => {
                  const dealTitle =
                    isAr && deal.titleAr ? deal.titleAr : deal.title
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {dealTitle}
                        </p>
                        {deal.discount && (
                          <p className="text-xs text-muted-foreground">
                            {isAr ? 'خصم' : 'Discount'} {deal.discount}%
                          </p>
                        )}
                      </div>
                      {deal.isFeatured && (
                        <Badge className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-[10px]">
                          {isAr ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Inquiry Button */}
          <Button
            onClick={() => setInquiryOpen(true)}
            className="w-full gap-2"
            variant={isPremium ? 'default' : 'outline'}
          >
            <MessageSquare className="h-4 w-4" />
            {isAr ? 'إرسال استفسار' : 'Send Inquiry'}
          </Button>
        </DialogContent>
      </Dialog>

      <InquiryDialog
        shop={displayShop}
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
      />
    </>
  )
}
