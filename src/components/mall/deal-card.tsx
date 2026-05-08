'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Tag, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useMallStore } from '@/lib/store'
import type { Deal } from '@/lib/types'

interface DealCardProps {
  deal: Deal
  featured?: boolean
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground" dir="ltr">
      <Clock className="h-3 w-3" />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  )
}

export function DealCard({ deal, featured = false }: DealCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const language = useMallStore((s) => s.language)
  const isAr = language === 'ar'

  const title = isAr && deal.titleAr ? deal.titleAr : deal.title
  const description = isAr && deal.descriptionAr ? deal.descriptionAr : deal.description
  const shopName = deal.shop ? (isAr && deal.shop.nameAr ? deal.shop.nameAr : deal.shop.name) : ''

  const placeholderColors = [
    'from-rose-400 to-orange-300',
    'from-emerald-400 to-teal-300',
    'from-violet-400 to-purple-300',
    'from-amber-400 to-yellow-300',
    'from-cyan-400 to-blue-300',
  ]
  const colorIndex = deal.id.charCodeAt(0) % placeholderColors.length

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card
          className={`group cursor-pointer overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg ${
            featured ? 'ring-2 ring-amber-400/60 shadow-amber-100' : ''
          }`}
          onClick={() => setDialogOpen(true)}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {deal.image ? (
              <Image
                src={deal.image}
                alt={title}
                fill
                style={{ objectFit: 'cover' }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                unoptimized
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${placeholderColors[colorIndex]} flex items-center justify-center`}
              >
                <Tag className="h-12 w-12 text-white/60" />
              </div>
            )}

            {/* Discount Badge */}
            {deal.discount && (
              <Badge className="absolute top-2 start-2 bg-red-500 text-white hover:bg-red-600 text-sm font-bold px-2.5 py-1">
                {`-${deal.discount}%`}
              </Badge>
            )}

            {/* Featured Badge */}
            {featured && (
              <Badge className="absolute top-2 end-2 bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold">
                ⭐ عرض خاص
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <CardContent className="p-4 space-y-2">
            {/* Shop Name */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Store className="h-3.5 w-3.5" />
              <span className="truncate">{shopName}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{title}</h3>

            {/* Prices */}
            <div className="flex items-center gap-2 flex-wrap">
              {deal.salePrice != null && (
                <span className="text-lg font-bold text-emerald-600">
                  {deal.salePrice.toFixed(2)} ر.س
                </span>
              )}
              {deal.originalPrice != null && (
                <span className="text-sm text-muted-foreground line-through">
                  {deal.originalPrice.toFixed(2)} ر.س
                </span>
              )}
            </div>

            {/* Countdown */}
            <CountdownTimer endDate={deal.endDate} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Deal Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">{title}</DialogTitle>
            <DialogDescription className="text-right">{shopName}</DialogDescription>
          </DialogHeader>

          {/* Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {deal.image ? (
              <Image src={deal.image} alt={title} fill style={{ objectFit: 'cover' }} className="h-full w-full object-cover" unoptimized />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${placeholderColors[colorIndex]} flex items-center justify-center`}
              >
                <Tag className="h-16 w-16 text-white/60" />
              </div>
            )}
            {deal.discount && (
              <Badge className="absolute top-3 start-3 bg-red-500 text-white text-lg font-bold px-3 py-1.5">
                {`-${deal.discount}%`}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            {description && (
              <p className="text-sm text-muted-foreground text-right">{description}</p>
            )}

            <div className="flex items-center gap-3 justify-end">
              {deal.salePrice != null && (
                <span className="text-2xl font-bold text-emerald-600">
                  {deal.salePrice.toFixed(2)} ر.س
                </span>
              )}
              {deal.originalPrice != null && (
                <span className="text-base text-muted-foreground line-through">
                  {deal.originalPrice.toFixed(2)} ر.س
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <CountdownTimer endDate={deal.endDate} />
              <span className="text-xs text-muted-foreground">
                {isAr ? 'ينتهي العرض في' : 'Offer expires on'}{' '}
                {new Date(deal.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
              </span>
            </div>

            <Button className="w-full" variant="default">
              {isAr ? 'زيارة المتجر' : 'Visit Shop'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
