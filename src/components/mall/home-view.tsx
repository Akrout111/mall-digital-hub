'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMallStore } from '@/lib/store'
import type { Banner, ShopCategory, Deal, Shop, MallInfo } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShopCard } from '@/components/mall/shop-card'
import { ShopDetailDialog } from '@/components/mall/shop-detail-dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Search,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  Flame,
  Store,
  Sparkles,
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Clapperboard,
  ShoppingCart,
  Dumbbell,
  Home as HomeIcon,
  ChevronLeft,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Map icon names from DB to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
  Clapperboard: <Clapperboard className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Home: <HomeIcon className="h-5 w-5" />,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function HomeView() {
  const { language, setView, setSelectedCategory } = useMallStore()
  const isAr = language === 'ar'

  const [mallInfo, setMallInfo] = useState<MallInfo | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([])
  const [popularShops, setPopularShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [shopDialogOpen, setShopDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [mallRes, bannersRes, categoriesRes, dealsRes, shopsRes] =
        await Promise.all([
          fetch('/api/mall'),
          fetch('/api/banners'),
          fetch('/api/categories'),
          fetch('/api/deals?featured=true'),
          fetch('/api/shops'),
        ])

      const mallData = await mallRes.json()
      const bannersData = await bannersRes.json()
      const categoriesData = await categoriesRes.json()
      const dealsData = await dealsRes.json()
      const shopsData = await shopsRes.json()

      if (!mallData.error) setMallInfo(mallData)
      if (Array.isArray(bannersData)) setBanners(bannersData)
      if (Array.isArray(categoriesData)) setCategories(categoriesData)
      if (Array.isArray(dealsData)) setFeaturedDeals(dealsData)
      if (Array.isArray(shopsData)) {
        // Show premium shops first, then alphabetically
        const sorted = [...shopsData].sort((a, b) => {
          if (a.subscriptionTier === 'premium' && b.subscriptionTier !== 'premium') return -1
          if (a.subscriptionTier !== 'premium' && b.subscriptionTier === 'premium') return 1
          return 0
        })
        setPopularShops(sorted.slice(0, 8))
      }
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setView('directory')
  }

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop)
    setShopDialogOpen(true)
  }

  if (loading) {
    return <HomeViewSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero Section */}
      <section className="mb-8">
        {banners.length > 0 ? (
          <Carousel
            opts={{
              loop: true,
              direction: isAr ? 'rtl' : 'ltr',
            }}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-background p-6 md:p-10 min-h-[200px] md:min-h-[280px] flex flex-col justify-end">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 start-0 h-40 w-40 rounded-full bg-amber-500 blur-3xl" />
                      <div className="absolute bottom-0 end-0 h-32 w-32 rounded-full bg-primary blur-3xl" />
                    </div>

                    <div className="relative z-10">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {isAr && banner.titleAr ? banner.titleAr : banner.title}
                      </h2>
                      {banner.link && (
                        <Button
                          variant="default"
                          className="gap-2 mt-2"
                          onClick={() => {
                            if (banner.link === 'deals') setView('deals')
                            else if (banner.link === 'directory') setView('directory')
                          }}
                        >
                          {isAr ? 'استكشف الآن' : 'Explore Now'}
                          <ChevronLeft className={`h-4 w-4 ${isAr ? '' : 'rotate-180'}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex start-[-1rem]" />
                <CarouselNext className="hidden md:flex end-[-1rem]" />
              </>
            )}
          </Carousel>
        ) : (
          /* Default Hero if no banners */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-background p-6 md:p-10 min-h-[200px] md:min-h-[280px] flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 start-0 h-40 w-40 rounded-full bg-amber-500 blur-3xl" />
              <div className="absolute bottom-0 end-0 h-32 w-32 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {mallInfo
                  ? isAr && mallInfo.nameAr
                    ? mallInfo.nameAr
                    : mallInfo.name
                  : isAr
                    ? 'جراند مول'
                    : 'Grand Mall'}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
                {mallInfo
                  ? isAr && mallInfo.descriptionAr
                    ? mallInfo.descriptionAr
                    : mallInfo.description
                  : isAr
                    ? 'وجهة التسوق الأولى في المدينة'
                    : 'The premier shopping destination'}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                {mallInfo && (
                  <>
                    <span className="flex items-center gap-1">
                      <Store className="h-3.5 w-3.5" />
                      {mallInfo.shopCount} {isAr ? 'متجر' : 'Shops'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {mallInfo.dealCount} {isAr ? 'عرض' : 'Deals'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => setView('supermarket')}
          >
            <ShoppingBag className="h-6 w-6 text-green-600" />
            <span className="text-xs">
              {isAr ? 'اطلب واستلم' : 'Click & Collect'}
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => setView('map')}
          >
            <MapPin className="h-6 w-6 text-blue-600" />
            <span className="text-xs">
              {isAr ? 'الخريطة' : 'Map'}
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => {
              setView('directory')
            }}
          >
            <Search className="h-6 w-6 text-purple-600" />
            <span className="text-xs">
              {isAr ? 'ابحث عن متجر' : 'Find Shop'}
            </span>
          </Button>
        </div>
      </section>

      {/* Categories Row */}
      {categories.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {isAr ? 'تصفح حسب القسم' : 'Browse by Category'}
          </h3>
          <motion.div
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {categories.map((cat) => {
              const catName = isAr && cat.nameAr ? cat.nameAr : cat.name
              return (
                <motion.div key={cat.id} variants={itemVariants}>
                  <Card
                    className="cursor-pointer shrink-0 transition-colors hover:bg-accent/50 border-0 shadow-sm"
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-4 min-w-[90px]">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: cat.color
                            ? `${cat.color}15`
                            : undefined,
                        }}
                      >
                        <span style={{ color: cat.color || undefined }}>
                          {iconMap[cat.icon || ''] || (
                            <Store className="h-5 w-5" />
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-center whitespace-nowrap">
                        {catName}
                      </span>
                      {cat._count?.shops !== undefined && (
                        <span className="text-[10px] text-muted-foreground">
                          {cat._count.shops} {isAr ? 'متجر' : 'shops'}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              {isAr ? 'عروض مميزة' : 'Featured Deals'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setView('deals')}
            >
              {isAr ? 'عرض الكل' : 'View All'}
              <ArrowLeft className={`h-3.5 w-3.5 ${isAr ? '' : 'rotate-180'}`} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredDeals.slice(0, 4).map((deal) => {
              const dealTitle =
                isAr && deal.titleAr ? deal.titleAr : deal.title
              const shopName =
                deal.shop && isAr && deal.shop.nameAr
                  ? deal.shop.nameAr
                  : deal.shop?.name || ''

              return (
                <motion.div
                  key={deal.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
                      {deal.discount && (
                        <Badge className="absolute top-2 start-2 bg-red-500 text-white border-0 gap-1">
                          <Flame className="h-3 w-3" />
                          {deal.discount}%
                        </Badge>
                      )}
                      {deal.image ? (
                        <img
                          src={deal.image}
                          alt={dealTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-3xl font-bold text-red-500/60">
                            {deal.discount}%
                          </span>
                          <span className="text-xs text-red-500/60">
                            {isAr ? 'خصم' : 'OFF'}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="text-sm font-semibold truncate">
                        {dealTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shopName}
                      </p>
                      {deal.originalPrice && deal.salePrice && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-red-500">
                            {deal.salePrice} {isAr ? 'ر.س' : 'SAR'}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {deal.originalPrice}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* Popular Shops */}
      {popularShops.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" />
              {isAr ? 'المتاجر الشائعة' : 'Popular Shops'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setView('directory')}
            >
              {isAr ? 'عرض الكل' : 'View All'}
              <ArrowLeft className={`h-3.5 w-3.5 ${isAr ? '' : 'rotate-180'}`} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onClick={() => handleShopClick(shop)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Shop Detail Dialog */}
      <ShopDetailDialog
        shop={selectedShop}
        open={shopDialogOpen}
        onOpenChange={setShopDialogOpen}
      />
    </div>
  )
}

function HomeViewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero Skeleton */}
      <Skeleton className="mb-8 h-[200px] w-full rounded-2xl md:h-[280px]" />

      {/* Quick Actions Skeleton */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Categories Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-[90px] shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Deals Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
