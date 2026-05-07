'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMallStore } from '@/lib/store'
import type { Shop, Deal, Order, Subscription, Banner } from '@/lib/types'
import { LoginCard } from '@/components/mall/login-card'
import { StatCard } from '@/components/mall/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'
import {
  LayoutDashboard,
  Store,
  Tag,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  LogOut,
  Plus,
  Shield,
  ShoppingBag,
  Image as ImageIcon,
  Star,
  Eye,
  Search,
} from 'lucide-react'

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const CHART_HEX_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6']

// ============ LOGIN GATE ============

function AdminLoginGate() {
  const loginAdmin = useMallStore((s) => s.loginAdmin)

  return (
    <LoginCard
      title="لوحة تحكم الإدارة"
      description="ادخل إلى لوحة التحكم لإدارة المركز التجاري"
      icon={<Shield className="size-8 text-white" />}
      onLogin={loginAdmin}
      loginLabel="دخول كمسؤول"
    />
  )
}

// ============ ADMIN DASHBOARD ============

function AdminDashboard() {
  const logoutAdmin = useMallStore((s) => s.logoutAdmin)
  const [activeTab, setActiveTab] = useState('statistics')

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-bl from-amber-500 to-orange-600">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">لوحة تحكم الإدارة</h1>
            <p className="text-muted-foreground text-sm">إدارة المركز التجاري</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logoutAdmin} className="gap-2">
          <LogOut className="size-4" />
          خروج
        </Button>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <ScrollArea className="w-full">
          <TabsList className="w-full flex-nowrap">
            <TabsTrigger value="statistics" className="gap-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="shops" className="gap-1.5 text-xs">
              <Store className="size-3.5" />
              المحلات
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs">
              <CreditCard className="size-3.5" />
              الاشتراكات
            </TabsTrigger>
            <TabsTrigger value="deal-approval" className="gap-1.5 text-xs">
              <CheckCircle className="size-3.5" />
              موافقة العروض
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs">
              <ShoppingBag className="size-3.5" />
              الطلبات
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-1.5 text-xs">
              <ImageIcon className="size-3.5" />
              البانرات
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>
        <TabsContent value="shops">
          <ShopsManagementTab />
        </TabsContent>
        <TabsContent value="subscriptions">
          <SubscriptionsTab />
        </TabsContent>
        <TabsContent value="deal-approval">
          <DealApprovalTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="banners">
          <BannersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============ STATISTICS TAB ============

interface StatsData {
  totals: {
    shops: number
    products: number
    deals: number
    orders: number
  }
  topShops: { entityId: string; views: number; shop: { id: string; name: string; nameAr: string } }[]
  topCategories: { entityId: string; views: number; category: { id: string; name: string; nameAr: string } }[]
}

function StatisticsTab() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [premiumCount, setPremiumCount] = useState(0)
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes, subsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/orders'),
          fetch('/api/subscriptions'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (ordersRes.ok) {
          const orders: Order[] = await ordersRes.json()
          const revenue = orders.reduce((sum, o) => sum + o.total, 0)
          setTotalRevenue(revenue)

          // Group by status
          const statusMap: Record<string, number> = {}
          for (const o of orders) {
            statusMap[o.status] = (statusMap[o.status] || 0) + 1
          }
          setOrdersByStatus(
            Object.entries(statusMap).map(([status, count]) => ({ status, count }))
          )
        }

        if (subsRes.ok) {
          const subs: Subscription[] = await subsRes.json()
          setPremiumCount(subs.filter((s) => s.tier === 'premium').length)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  const topShopsData = (stats?.topShops || []).slice(0, 5).map((s) => ({
    name: s.shop?.nameAr || s.shop?.name || 'غير معروف',
    views: s.views,
  }))

  const topCategoriesData = (stats?.topCategories || []).slice(0, 5).map((c) => ({
    name: c.category?.nameAr || c.category?.name || 'غير معروف',
    views: c.views,
  }))

  const orderStatusLabels: Record<string, string> = {
    pending: 'معلق',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    collected: 'تم الاستلام',
    cancelled: 'ملغي',
  }

  const ordersChartData = ordersByStatus.map((o) => ({
    name: orderStatusLabels[o.status] || o.status,
    value: o.count,
  }))

  const barChartConfig: ChartConfig = {
    views: { label: 'المشاهدات' },
    name: { label: 'الاسم' },
  }

  const pieChartConfig: ChartConfig = {
    views: { label: 'المشاهدات' },
    name: { label: 'التصنيف' },
  }

  const ordersChartConfig: ChartConfig = {
    value: { label: 'العدد' },
    name: { label: 'الحالة' },
  }

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          title="المحلات"
          value={stats?.totals.shops ?? 0}
          icon={<Store className="size-5 text-emerald-600" />}
          iconBgColor="bg-emerald-500/10"
        />
        <StatCard
          title="المنتجات"
          value={stats?.totals.products ?? 0}
          icon={<Package2Icon className="size-5 text-blue-600" />}
          iconBgColor="bg-blue-500/10"
        />
        <StatCard
          title="العروض النشطة"
          value={stats?.totals.deals ?? 0}
          icon={<Tag className="size-5 text-amber-600" />}
          iconBgColor="bg-amber-500/10"
        />
        <StatCard
          title="الطلبات"
          value={stats?.totals.orders ?? 0}
          icon={<ShoppingBag className="size-5 text-purple-600" />}
          iconBgColor="bg-purple-500/10"
        />
        <StatCard
          title="الإيرادات"
          value={`${totalRevenue.toFixed(0)} ر.س`}
          icon={<CreditCard className="size-5 text-emerald-600" />}
          iconBgColor="bg-emerald-500/10"
        />
        <StatCard
          title="اشتراكات مميزة"
          value={premiumCount}
          icon={<Star className="size-5 text-amber-600" />}
          iconBgColor="bg-amber-500/10"
        />
      </div>

      {/* Charts */}
      {topShopsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أكثر المحلات زيارة</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
              <BarChart data={topShopsData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {topCategoriesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">التصنيفات</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={topCategoriesData}
                    dataKey="views"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topCategoriesData.map((_, i) => (
                      <Cell key={i} fill={CHART_HEX_COLORS[i % CHART_HEX_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {ordersChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الطلبات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ordersChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={ordersChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ordersChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_HEX_COLORS[i % CHART_HEX_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Package2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  )
}

// ============ SHOPS MANAGEMENT TAB ============

function ShopsManagementTab() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')

  useEffect(() => {
    fetch('/api/shops')
      .then((r) => r.json())
      .then((data) => {
        setShops(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      !search ||
      shop.name.toLowerCase().includes(search.toLowerCase()) ||
      (shop.nameAr && shop.nameAr.includes(search))
    const matchesTier =
      filterTier === 'all' || shop.subscriptionTier === filterTier
    return matchesSearch && matchesTier
  })

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="بحث عن محل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="الاشتراك" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="premium">مميز</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الطابق</TableHead>
                <TableHead>الاشتراك</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {shop.logo && <img src={shop.logo} alt="" className="size-8 rounded object-cover" />}
                      <div>
                        <p className="font-medium">{shop.nameAr || shop.name}</p>
                        <p className="text-muted-foreground text-xs" dir="ltr">{shop.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{shop.category?.nameAr || shop.category?.name}</TableCell>
                  <TableCell>{shop.floor}</TableCell>
                  <TableCell>
                    <Badge variant={shop.subscriptionTier === 'premium' ? 'default' : 'outline'} className={shop.subscriptionTier === 'premium' ? 'bg-amber-500' : ''}>
                      {shop.subscriptionTier === 'premium' ? 'مميز' : 'مجاني'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shop.isOpen ? 'default' : 'secondary'} className={shop.isOpen ? 'bg-emerald-600' : ''}>
                      {shop.isOpen ? 'مفتوح' : 'مغلق'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {filteredShops.map((shop) => (
          <Card key={shop.id} className="gap-2 py-3">
            <CardContent className="px-4">
              <div className="flex items-center gap-3">
                {shop.logo && <img src={shop.logo} alt="" className="size-10 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{shop.nameAr || shop.name}</p>
                  <p className="text-muted-foreground text-xs">{shop.category?.nameAr || shop.category?.name} • طابق {shop.floor}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant={shop.subscriptionTier === 'premium' ? 'default' : 'outline'} className={shop.subscriptionTier === 'premium' ? 'bg-amber-500' : ''}>
                    {shop.subscriptionTier === 'premium' ? 'مميز' : 'مجاني'}
                  </Badge>
                  <Badge variant={shop.isOpen ? 'default' : 'secondary'} className={shop.isOpen ? 'bg-emerald-600' : ''}>
                    {shop.isOpen ? 'مفتوح' : 'مغلق'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredShops.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">لا توجد نتائج</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ============ SUBSCRIPTIONS TAB ============

interface EnrichedSubscription {
  id: string
  shopId: string
  tier: string
  startDate: string
  endDate: string
  isActive: boolean
  shop?: { id: string; name: string; nameAr: string; logo?: string | null }
}

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<EnrichedSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch('/api/subscriptions')
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubs()
  }, [fetchSubs])

  const handleToggleTier = async (shopId: string, currentTier: string) => {
    const newTier = currentTier === 'premium' ? 'free' : 'premium'
    setUpdating(shopId)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, tier: newTier }),
      })
      if (res.ok) {
        fetchSubs()
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">إدارة الاشتراكات</h3>
      {subscriptions.map((sub) => (
        <Card key={sub.id} className="gap-2 py-3">
          <CardContent className="px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {sub.shop?.logo && <img src={sub.shop.logo} alt="" className="size-10 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <p className="font-medium truncate">{sub.shop?.nameAr || sub.shop?.name}</p>
                  <Badge variant={sub.tier === 'premium' ? 'default' : 'outline'} className={sub.tier === 'premium' ? 'bg-amber-500' : ''}>
                    {sub.tier === 'premium' ? 'مميز' : 'مجاني'}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant={sub.tier === 'premium' ? 'outline' : 'default'}
                onClick={() => handleToggleTier(sub.shopId, sub.tier)}
                disabled={updating === sub.shopId}
                className={sub.tier !== 'premium' ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                {updating === sub.shopId
                  ? 'جاري التحديث...'
                  : sub.tier === 'premium'
                    ? 'تخفيض لمجاني'
                    : 'ترقية لمميز'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ DEAL APPROVAL TAB ============

function DealApprovalTab() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals/manage')
      if (res.ok) {
        const data = await res.json()
        setDeals(Array.isArray(data) ? data : [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const handleApprove = async (dealId: string, isApproved: boolean) => {
    setUpdating(dealId)
    try {
      const res = await fetch('/api/deals/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, isApproved }),
      })
      if (res.ok) {
        fetchDeals()
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleFeatured = async (dealId: string, isFeatured: boolean) => {
    setUpdating(dealId)
    try {
      const res = await fetch('/api/deals/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId, isFeatured }),
      })
      if (res.ok) {
        fetchDeals()
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  const pendingDeals = deals.filter((d) => !d.isApproved)
  const approvedDeals = deals.filter((d) => d.isApproved)

  return (
    <div className="space-y-4">
      {/* Pending Deals */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          عروض قيد المراجعة ({pendingDeals.length})
        </h3>
        {pendingDeals.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">لا توجد عروض بانتظار المراجعة</p>
            </CardContent>
          </Card>
        ) : (
          pendingDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              updating={updating}
              onApprove={handleApprove}
              onToggleFeatured={handleToggleFeatured}
            />
          ))
        )}
      </div>

      <Separator />

      {/* Approved Deals */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="size-4 text-emerald-500" />
          عروض مقبولة ({approvedDeals.length})
        </h3>
        {approvedDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            updating={updating}
            onApprove={handleApprove}
            onToggleFeatured={handleToggleFeatured}
          />
        ))}
      </div>
    </div>
  )
}

function DealCard({
  deal,
  updating,
  onApprove,
  onToggleFeatured,
}: {
  deal: Deal
  updating: string | null
  onApprove: (id: string, approved: boolean) => Promise<void>
  onToggleFeatured: (id: string, featured: boolean) => Promise<void>
}) {
  return (
    <Card className="gap-2 py-3">
      <CardContent className="px-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="font-semibold">{deal.titleAr || deal.title}</p>
            <p className="text-muted-foreground text-sm">
              {deal.shop?.nameAr || deal.shop?.name}
            </p>
          </div>
          <Badge
            variant={deal.isApproved ? 'default' : 'outline'}
            className={deal.isApproved ? 'bg-emerald-600' : 'border-amber-500 text-amber-600'}
          >
            {deal.isApproved ? 'مقبول' : 'قيد المراجعة'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {deal.discount && <Badge variant="secondary">خصم {deal.discount}%</Badge>}
          {deal.originalPrice && <span className="text-muted-foreground line-through">{deal.originalPrice} ر.س</span>}
          {deal.salePrice && <span className="font-bold text-emerald-600">{deal.salePrice} ر.س</span>}
        </div>

        <div className="text-muted-foreground text-xs flex gap-3">
          <span>من: {deal.startDate ? new Date(deal.startDate).toLocaleDateString('ar') : '-'}</span>
          <span>إلى: {deal.endDate ? new Date(deal.endDate).toLocaleDateString('ar') : '-'}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {!deal.isApproved && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 gap-1"
              onClick={() => onApprove(deal.id, true)}
              disabled={updating === deal.id}
            >
              <CheckCircle className="size-3.5" />
              قبول
            </Button>
          )}
          {deal.isApproved && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1"
              onClick={() => onApprove(deal.id, false)}
              disabled={updating === deal.id}
            >
              <XCircle className="size-3.5" />
              رفض
            </Button>
          )}
          <Button
            size="sm"
            variant={deal.isFeatured ? 'default' : 'outline'}
            className={deal.isFeatured ? 'bg-amber-500 hover:bg-amber-600 gap-1' : 'gap-1'}
            onClick={() => onToggleFeatured(deal.id, !deal.isFeatured)}
            disabled={updating === deal.id}
          >
            <Star className="size-3.5" />
            {deal.isFeatured ? 'مميز' : 'تمييز'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ ORDERS TAB ============

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchId, setSearchId] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = !searchId || order.id.toLowerCase().includes(searchId.toLowerCase()) || order.id.slice(-6).includes(searchId)
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">معلق</Badge>
      case 'preparing':
        return <Badge className="bg-blue-500">قيد التحضير</Badge>
      case 'ready':
        return <Badge className="bg-emerald-600">جاهز</Badge>
      case 'collected':
        return <Badge variant="secondary">تم الاستلام</Badge>
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="بحث برقم الطلب..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="pr-9"
            dir="ltr"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="preparing">قيد التحضير</SelectItem>
            <SelectItem value="ready">جاهز</SelectItem>
            <SelectItem value="collected">تم الاستلام</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="gap-2 py-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
            <CardContent className="px-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">#{order.id.slice(-6)}</p>
                  <p className="text-muted-foreground text-xs">
                    {order.shop?.nameAr || order.shop?.name} • {new Date(order.createdAt).toLocaleDateString('ar')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{order.total.toFixed(2)} ر.س</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المحل</span>
                <span className="font-medium">{selectedOrder.shop?.nameAr || selectedOrder.shop?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الحالة</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاريخ</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString('ar')}</span>
              </div>

              <Separator />

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">المنتجات:</p>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product?.nameAr || item.product?.name} × {item.quantity}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>الإجمالي</span>
                    <span>{selectedOrder.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-medium mb-1">ملاحظات:</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ BANNERS TAB ============

function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(Array.isArray(data) ? data : [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const handleAddBanner = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      // Get the first mall ID for the banner
      const mallRes = await fetch('/api/mall')
      let mallId = ''
      if (mallRes.ok) {
        const mallData = await mallRes.json()
        mallId = mallData.id
      }

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mallId,
          title,
          titleAr,
          image: imageUrl,
          link,
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          priority: 0,
        }),
      })
      if (res.ok) {
        setMessage('تم إضافة البانر بنجاح')
        setShowForm(false)
        setTitle('')
        setTitleAr('')
        setImageUrl('')
        setLink('')
        setStartDate('')
        setEndDate('')
        fetchBanners()
      } else {
        const data = await res.json()
        setMessage(data.error || 'حدث خطأ')
      }
    } catch {
      setMessage('حدث خطأ أثناء الإضافة')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة البانرات</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              إضافة بانر
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة بانر جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>العنوان (إنجليزي)</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>رابط الصورة</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} dir="ltr" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>رابط التوجيه</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} dir="ltr" placeholder="https://..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>تاريخ البداية</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} dir="ltr" />
                </div>
              </div>
              {message && (
                <p className={`text-sm ${message.includes('بنجاح') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>
              )}
              <Button onClick={handleAddBanner} disabled={submitting || !title} className="w-full">
                {submitting ? 'جاري الإضافة...' : 'إضافة البانر'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ImageIcon className="text-muted-foreground mx-auto size-10 mb-2" />
            <p className="text-muted-foreground">لا توجد بانرات حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <Card key={banner.id} className="gap-2 py-3 overflow-hidden">
              <CardContent className="px-4">
                <div className="flex items-start gap-3">
                  {banner.image && (
                    <img src={banner.image} alt="" className="size-16 rounded-md object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium truncate">{banner.titleAr || banner.title}</p>
                    <p className="text-muted-foreground text-xs truncate" dir="ltr">{banner.title}</p>
                    <div className="text-muted-foreground flex gap-3 text-xs">
                      <span>من: {new Date(banner.startDate).toLocaleDateString('ar')}</span>
                      <span>إلى: {new Date(banner.endDate).toLocaleDateString('ar')}</span>
                    </div>
                    <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-emerald-600' : ''}>
                      {banner.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ MAIN EXPORT ============

export function AdminView() {
  const isAdminLoggedIn = useMallStore((s) => s.isAdminLoggedIn)

  if (!isAdminLoggedIn) {
    return <AdminLoginGate />
  }

  return <AdminDashboard />
}
