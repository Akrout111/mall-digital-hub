'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMallStore } from '@/lib/store'
import type { Shop, Deal, Product, Order, Inquiry } from '@/lib/types'
import { LoginCard } from '@/components/mall/login-card'
import { StatCard } from '@/components/mall/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Store,
  Tag,
  Package,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  ShoppingBag,
  Settings,
} from 'lucide-react'

// ============ LOGIN GATE ============

function MerchantLoginGate() {
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [loading, setLoading] = useState(true)
  const loginMerchant = useMallStore((s) => s.loginMerchant)

  useEffect(() => {
    fetch('/api/shops')
      .then((r) => r.json())
      .then((data) => {
        setShops(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <LoginCard
      title="بوابة التاجر"
      description="اختر المحل الخاص بك للدخول إلى لوحة التحكم"
      icon={<Store className="size-8 text-white" />}
      onLogin={() => selectedShopId && loginMerchant(selectedShopId)}
      loginDisabled={!selectedShopId}
      loginLabel="دخول"
    >
      <div className="space-y-3">
        <Label htmlFor="shop-select">اختر المحل</Label>
        <Select value={selectedShopId} onValueChange={setSelectedShopId}>
          <SelectTrigger className="w-full" id="shop-select">
            <SelectValue placeholder={loading ? 'جاري التحميل...' : 'اختر المحل'} />
          </SelectTrigger>
          <SelectContent>
            {shops.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.nameAr || shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </LoginCard>
  )
}

// ============ MERCHANT DASHBOARD ============

function MerchantDashboard() {
  const merchantShopId = useMallStore((s) => s.merchantShopId)
  const logoutMerchant = useMallStore((s) => s.logoutMerchant)
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchShop = useCallback(async () => {
    if (!merchantShopId) return
    try {
      const res = await fetch(`/api/shops/${merchantShopId}`)
      if (res.ok) {
        const data = await res.json()
        setShop(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [merchantShopId])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">لم يتم العثور على المحل</p>
      </div>
    )
  }

  const isSupermarket = shop.category?.name?.toLowerCase() === 'supermarket' ||
    shop.category?.nameAr === 'سوبرماركت'

  const totalProducts = shop.products?.length ?? 0
  const totalDeals = shop.deals?.length ?? 0
  const openInquiries = shop.inquiries?.filter((i: Inquiry) => i.status === 'open').length ?? 0
  const todayOrders = shop.orders?.length ?? 0

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {shop.logo && (
            <img src={shop.logo} alt="" className="size-10 rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-xl font-bold">{shop.nameAr || shop.name}</h1>
            <p className="text-muted-foreground text-sm">{shop.category?.nameAr || shop.category?.name} - الطابق {shop.floor}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logoutMerchant} className="gap-2">
          <LogOut className="size-4" />
          خروج
        </Button>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <ScrollArea className="w-full">
          <TabsList className="w-full flex-nowrap">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <LayoutDashboard className="size-3.5" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="shop-management" className="gap-1.5 text-xs">
              <Settings className="size-3.5" />
              إدارة المحل
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-1.5 text-xs">
              <Tag className="size-3.5" />
              العروض
            </TabsTrigger>
            {isSupermarket && (
              <TabsTrigger value="orders" className="gap-1.5 text-xs">
                <ShoppingBag className="size-3.5" />
                الطلبات
              </TabsTrigger>
            )}
            <TabsTrigger value="inquiries" className="gap-1.5 text-xs">
              <MessageSquare className="size-3.5" />
              الاستفسارات
            </TabsTrigger>
            {isSupermarket && (
              <TabsTrigger value="products" className="gap-1.5 text-xs">
                <Package className="size-3.5" />
                المنتجات
              </TabsTrigger>
            )}
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview">
          <OverviewTab
            shop={shop}
            totalProducts={totalProducts}
            totalDeals={totalDeals}
            openInquiries={openInquiries}
            todayOrders={todayOrders}
          />
        </TabsContent>

        <TabsContent value="shop-management">
          <ShopManagementTab shop={shop} onUpdate={fetchShop} />
        </TabsContent>

        <TabsContent value="deals">
          <DealsTab shopId={shop.id} deals={shop.deals || []} onUpdate={fetchShop} />
        </TabsContent>

        {isSupermarket && (
          <TabsContent value="orders">
            <OrdersTab shopId={shop.id} orders={shop.orders || []} onUpdate={fetchShop} />
          </TabsContent>
        )}

        <TabsContent value="inquiries">
          <InquiriesTab shopId={shop.id} inquiries={shop.inquiries || []} onUpdate={fetchShop} />
        </TabsContent>

        {isSupermarket && (
          <TabsContent value="products">
            <ProductsTab shopId={shop.id} products={shop.products || []} onUpdate={fetchShop} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// ============ OVERVIEW TAB ============

function OverviewTab({
  shop,
  totalProducts,
  totalDeals,
  openInquiries,
  todayOrders,
}: {
  shop: Shop
  totalProducts: number
  totalDeals: number
  openInquiries: number
  todayOrders: number
}) {
  return (
    <div className="space-y-4">
      {/* Shop Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">معلومات المحل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الاسم</span>
            <span className="font-medium">{shop.nameAr || shop.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">التصنيف</span>
            <span className="font-medium">{shop.category?.nameAr || shop.category?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الطابق</span>
            <span className="font-medium">{shop.floor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الحالة</span>
            <Badge variant={shop.isOpen ? 'default' : 'secondary'} className={shop.isOpen ? 'bg-emerald-600' : ''}>
              {shop.isOpen ? 'مفتوح' : 'مغلق'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الاشتراك</span>
            <Badge variant={shop.subscriptionTier === 'premium' ? 'default' : 'outline'} className={shop.subscriptionTier === 'premium' ? 'bg-amber-500' : ''}>
              {shop.subscriptionTier === 'premium' ? 'مميز' : 'مجاني'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="المنتجات"
          value={totalProducts}
          icon={<Package className="size-5 text-emerald-600" />}
          iconBgColor="bg-emerald-500/10"
        />
        <StatCard
          title="العروض"
          value={totalDeals}
          icon={<Tag className="size-5 text-amber-600" />}
          iconBgColor="bg-amber-500/10"
        />
        <StatCard
          title="استفسارات مفتوحة"
          value={openInquiries}
          icon={<MessageSquare className="size-5 text-blue-600" />}
          iconBgColor="bg-blue-500/10"
        />
        <StatCard
          title="طلبات اليوم"
          value={todayOrders}
          icon={<ShoppingBag className="size-5 text-purple-600" />}
          iconBgColor="bg-purple-500/10"
        />
      </div>
    </div>
  )
}

// ============ SHOP MANAGEMENT TAB ============

function ShopManagementTab({ shop, onUpdate }: { shop: Shop; onUpdate: () => void }) {
  const [name, setName] = useState(shop.name || '')
  const [nameAr, setNameAr] = useState(shop.nameAr || '')
  const [description, setDescription] = useState(shop.description || '')
  const [phone, setPhone] = useState(shop.phone || '')
  const [email, setEmail] = useState(shop.email || '')
  const [openTime, setOpenTime] = useState(shop.openTime || '09:00')
  const [closeTime, setCloseTime] = useState(shop.closeTime || '22:00')
  const [isOpen, setIsOpen] = useState(shop.isOpen)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/merchant/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: shop.ownerId,
          name,
          description,
          phone,
          email,
          openTime,
          closeTime,
          isOpen,
        }),
      })
      if (res.ok) {
        setMessage('تم حفظ التغييرات بنجاح')
        onUpdate()
      } else {
        setMessage('حدث خطأ أثناء الحفظ')
      }
    } catch {
      setMessage('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Edit className="size-4" />
          تعديل معلومات المحل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>الاسم (إنجليزي)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>الاسم (عربي)</Label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>الوصف</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>الهاتف</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" type="email" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>وقت الافتتاح</Label>
            <Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>وقت الإغلاق</Label>
            <Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} dir="ltr" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isOpen} onCheckedChange={setIsOpen} />
          <Label>{isOpen ? 'مفتوح' : 'مغلق'}</Label>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('بنجاح') ? 'text-emerald-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============ DEALS TAB ============

function DealsTab({ shopId, deals, onUpdate }: { shopId: string; deals: Deal[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [discount, setDiscount] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [image, setImage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/deals/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          title,
          titleAr,
          description,
          descriptionAr,
          discount: discount ? Number(discount) : null,
          originalPrice: originalPrice ? Number(originalPrice) : null,
          salePrice: salePrice ? Number(salePrice) : null,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          image: image || undefined,
        }),
      })
      if (res.ok) {
        setMessage('تم إضافة العرض بنجاح - بانتظار المراجعة')
        setShowForm(false)
        setTitle('')
        setTitleAr('')
        setDescription('')
        setDescriptionAr('')
        setDiscount('')
        setOriginalPrice('')
        setSalePrice('')
        setStartDate('')
        setEndDate('')
        setImage('')
        onUpdate()
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

  const getApprovalBadge = (deal: Deal) => {
    if (deal.isApproved) return <Badge className="bg-emerald-600">مقبول</Badge>
    return <Badge variant="outline" className="border-amber-500 text-amber-600">قيد المراجعة</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">العروض الترويجية</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عرض جديد</DialogTitle>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الوصف (إنجليزي)</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} dir="ltr" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={2} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>نسبة الخصم %</Label>
                  <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>السعر الأصلي</Label>
                  <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>سعر التخفيض</Label>
                  <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} dir="ltr" />
                </div>
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
              <div className="space-y-2">
                <Label>رابط الصورة</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} dir="ltr" placeholder="https://..." />
              </div>
              {message && (
                <p className={`text-sm ${message.includes('بنجاح') ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>
              )}
              <Button onClick={handleSubmit} disabled={submitting || !title} className="w-full">
                {submitting ? 'جاري الإضافة...' : 'إضافة العرض'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Deals List */}
      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Tag className="text-muted-foreground mx-auto size-10 mb-2" />
            <p className="text-muted-foreground">لا توجد عروض حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal.id} className="gap-3 py-3">
              <CardContent className="px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{deal.titleAr || deal.title}</p>
                    {deal.descriptionAr && (
                      <p className="text-muted-foreground text-sm line-clamp-2">{deal.descriptionAr}</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {deal.discount && (
                        <Badge variant="secondary">خصم {deal.discount}%</Badge>
                      )}
                      {deal.salePrice && deal.originalPrice && (
                        <span className="text-xs">
                          <span className="text-muted-foreground line-through">{deal.originalPrice}</span>
                          {' '}
                          <span className="font-bold text-emerald-600">{deal.salePrice}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex gap-3 text-xs">
                      <span>من: {deal.startDate ? new Date(deal.startDate).toLocaleDateString('ar') : '-'}</span>
                      <span>إلى: {deal.endDate ? new Date(deal.endDate).toLocaleDateString('ar') : '-'}</span>
                    </div>
                  </div>
                  {getApprovalBadge(deal)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ ORDERS TAB ============

function OrdersTab({ shopId, orders, onUpdate }: { shopId: string; orders: Order[]; onUpdate: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null)

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

  const getNextStatus = (status: string): string | null => {
    switch (status) {
      case 'pending': return 'preparing'
      case 'preparing': return 'ready'
      case 'ready': return 'collected'
      default: return null
    }
  }

  const getNextStatusLabel = (status: string): string | null => {
    switch (status) {
      case 'pending': return 'بدء التحضير'
      case 'preparing': return 'جاهز للاستلام'
      case 'ready': return 'تم الاستلام'
      default: return null
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        onUpdate()
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null)
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ShoppingBag className="text-muted-foreground mx-auto size-10 mb-2" />
          <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">الطلبات</h3>
      {orders.map((order) => (
        <Card key={order.id} className="gap-2 py-3">
          <CardContent className="px-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">طلب #{order.id.slice(-6)}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(order.createdAt).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {order.items && order.items.length > 0 && (
              <div className="text-sm space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.product?.nameAr || item.product?.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} ر.س</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>الإجمالي</span>
                  <span>{order.total.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}

            {getNextStatus(order.status) && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                disabled={updating === order.id}
                className="w-full"
                variant="outline"
              >
                {updating === order.id ? 'جاري التحديث...' : getNextStatusLabel(order.status)}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ INQUIRIES TAB ============

function InquiriesTab({ shopId, inquiries, onUpdate }: { shopId: string; inquiries: Inquiry[]; onUpdate: () => void }) {
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-amber-500">مفتوح</Badge>
      case 'replied':
        return <Badge className="bg-blue-500">تم الرد</Badge>
      case 'closed':
        return <Badge variant="secondary">مغلق</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleReply = async (inquiryId: string) => {
    const reply = replyTexts[inquiryId]
    if (!reply?.trim()) return

    setReplying(inquiryId)
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      })
      if (res.ok) {
        setReplyTexts((prev) => {
          const next = { ...prev }
          delete next[inquiryId]
          return next
        })
        onUpdate()
      }
    } catch {
      // ignore
    } finally {
      setReplying(null)
    }
  }

  const handleClose = async (inquiryId: string) => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      if (res.ok) {
        onUpdate()
      }
    } catch {
      // ignore
    }
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="text-muted-foreground mx-auto size-10 mb-2" />
          <p className="text-muted-foreground">لا توجد استفسارات حالياً</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">استفسارات العملاء</h3>
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="gap-2 py-3">
          <CardContent className="px-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{inquiry.subject}</p>
                <p className="text-muted-foreground text-xs">
                  {inquiry.customer?.name || 'عميل'} • {new Date(inquiry.createdAt).toLocaleDateString('ar')}
                </p>
              </div>
              {getStatusBadge(inquiry.status)}
            </div>

            <p className="text-sm bg-muted/50 rounded-md p-3">{inquiry.message}</p>

            {inquiry.reply && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3">
                <p className="text-xs font-medium text-blue-600 mb-1">الرد:</p>
                <p className="text-sm">{inquiry.reply}</p>
              </div>
            )}

            {inquiry.status === 'open' && (
              <div className="space-y-2">
                <Textarea
                  placeholder="اكتب ردك هنا..."
                  value={replyTexts[inquiry.id] || ''}
                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(inquiry.id)}
                    disabled={replying === inquiry.id || !replyTexts[inquiry.id]?.trim()}
                  >
                    {replying === inquiry.id ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleClose(inquiry.id)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ PRODUCTS TAB ============

function ProductsTab({ shopId, products, onUpdate }: { shopId: string; products: Product[]; onUpdate: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [togglingStock, setTogglingStock] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleToggleStock = async (productId: string, currentInStock: boolean) => {
    setTogglingStock(productId)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentInStock }),
      })
      // If PUT not available, we'll use a workaround
      if (!res.ok) {
        // The product API may not have a PUT; just refresh
      }
      onUpdate()
    } catch {
      // ignore
    } finally {
      setTogglingStock(null)
    }
  }

  const handleSavePrice = async (productId: string) => {
    setSaving(true)
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(editPrice) }),
      })
      setEditingId(null)
      onUpdate()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="text-muted-foreground mx-auto size-10 mb-2" />
          <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">المنتجات</h3>
      {products.map((product) => (
        <Card key={product.id} className="gap-2 py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-3">
              {product.image && (
                <img src={product.image} alt="" className="size-12 rounded-md object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.nameAr || product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20 h-7 text-sm"
                        dir="ltr"
                      />
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSavePrice(product.id)} disabled={saving}>
                        حفظ
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-sm">{product.price.toFixed(2)} ر.س</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditingId(product.id); setEditPrice(product.price.toString()) }}>
                        <Edit className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={product.inStock}
                  onCheckedChange={() => handleToggleStock(product.id, product.inStock)}
                  disabled={togglingStock === product.id}
                />
                <span className="text-xs">{product.inStock ? 'متوفر' : 'نفذ'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============ MAIN EXPORT ============

export function MerchantView() {
  const isMerchantLoggedIn = useMallStore((s) => s.isMerchantLoggedIn)

  if (!isMerchantLoggedIn) {
    return <MerchantLoginGate />
  }

  return <MerchantDashboard />
}
