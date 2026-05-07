'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMallStore } from '@/lib/store'
import type { Shop, ShopCategory } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ShopCard } from '@/components/mall/shop-card'
import { ShopDetailDialog } from '@/components/mall/shop-detail-dialog'
import {
  Search,
  X,
  Store,
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Clapperboard,
  ShoppingCart,
  Sparkles,
  Dumbbell,
  Home as HomeIcon,
  SlidersHorizontal,
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="h-3.5 w-3.5" />,
  Smartphone: <Smartphone className="h-3.5 w-3.5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-3.5 w-3.5" />,
  Clapperboard: <Clapperboard className="h-3.5 w-3.5" />,
  ShoppingCart: <ShoppingCart className="h-3.5 w-3.5" />,
  Sparkles: <Sparkles className="h-3.5 w-3.5" />,
  Dumbbell: <Dumbbell className="h-3.5 w-3.5" />,
  Home: <HomeIcon className="h-3.5 w-3.5" />,
}

export function DirectoryView() {
  const { language, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useMallStore()
  const isAr = language === 'ar'

  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [shopDialogOpen, setShopDialogOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchShops = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)
      if (floorFilter !== 'all') params.set('floor', floorFilter)
      if (openOnly) params.set('isOpen', 'true')

      const res = await fetch(`/api/shops?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) setShops(data)
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, floorFilter, openOnly])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (Array.isArray(data)) setCategories(data)
    } catch {
      // Silently handle errors
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 300)
  }

  const handleClearSearch = () => {
    setLocalSearch('')
    setSearchQuery('')
  }

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop)
    setShopDialogOpen(true)
  }

  const activeCategory = categories.find((c) => c.id === selectedCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">
          {isAr ? 'دليل المتاجر' : 'Shop Directory'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? 'ابحث عن متجرك المفضل من بين المتاجر المتاحة'
            : 'Find your favorite store from our directory'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={
            isAr
              ? 'ابحث عن متجر، علامة تجارية، أو قسم...'
              : 'Search for a shop, brand, or category...'
          }
          className="ps-9 pe-9 h-12 text-base rounded-xl"
        />
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            className="shrink-0 gap-1.5 rounded-full"
            onClick={() => handleCategoryClick(null)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {isAr ? 'الكل' : 'All'}
          </Button>
          {categories.map((cat) => {
            const catName = isAr && cat.nameAr ? cat.nameAr : cat.name
            const isActive = selectedCategory === cat.id
            return (
              <Button
                key={cat.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 gap-1.5 rounded-full"
                onClick={() => handleCategoryClick(cat.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: cat.color || undefined,
                        borderColor: cat.color || undefined,
                      }
                    : {
                        borderColor: cat.color ? `${cat.color}60` : undefined,
                        color: cat.color || undefined,
                      }
                }
              >
                {iconMap[cat.icon || ''] || <Store className="h-3.5 w-3.5" />}
                {catName}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Floor Filter & Open Only Toggle */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Tabs
          value={floorFilter}
          onValueChange={setFloorFilter}
          className="w-auto"
        >
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs px-3">
              {isAr ? 'كل الطوابق' : 'All Floors'}
            </TabsTrigger>
            <TabsTrigger value="1" className="text-xs px-3">
              {isAr ? 'طابق ١' : 'Floor 1'}
            </TabsTrigger>
            <TabsTrigger value="2" className="text-xs px-3">
              {isAr ? 'طابق ٢' : 'Floor 2'}
            </TabsTrigger>
            <TabsTrigger value="3" className="text-xs px-3">
              {isAr ? 'طابق ٣' : 'Floor 3'}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Switch
            id="open-only"
            checked={openOnly}
            onCheckedChange={setOpenOnly}
          />
          <Label htmlFor="open-only" className="text-xs cursor-pointer whitespace-nowrap">
            {isAr ? 'مفتوح فقط' : 'Open Only'}
          </Label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCategory || floorFilter !== 'all' || openOnly || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">
            {isAr ? 'الفلاتر النشطة:' : 'Active filters:'}
          </span>
          {selectedCategory && activeCategory && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => handleCategoryClick(null)}
            >
              {isAr && activeCategory.nameAr ? activeCategory.nameAr : activeCategory.name}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {floorFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => setFloorFilter('all')}
            >
              {isAr ? `طابق ${floorFilter}` : `Floor ${floorFilter}`}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {openOnly && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => setOpenOnly(false)}
            >
              {isAr ? 'مفتوح فقط' : 'Open Only'}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={handleClearSearch}
            >
              &ldquo;{searchQuery}&rdquo;
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {loading
            ? isAr
              ? 'جاري البحث...'
              : 'Searching...'
            : isAr
              ? `${shops.length} متجر`
              : `${shops.length} shops found`}
        </p>
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {isAr ? 'لم يتم العثور على متاجر' : 'No shops found'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {isAr
              ? 'جرّب تعديل معايير البحث أو إزالة بعض الفلاتر'
              : 'Try adjusting your search criteria or removing some filters'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              handleCategoryClick(null)
              setFloorFilter('all')
              setOpenOnly(false)
              handleClearSearch()
            }}
          >
            {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onClick={() => handleShopClick(shop)}
            />
          ))}
        </div>
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
