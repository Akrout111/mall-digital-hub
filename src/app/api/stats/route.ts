import { db } from '@/lib/db'
import { successResponse, forbiddenResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET() {
  try {
    // Only admins can see stats
    const session = await requireAdmin()
    if (!session) {
      return forbiddenResponse()
    }

    // Get overall counts
    const [totalShops, totalProducts, totalDeals, totalOrders] = await Promise.all([
      db.shop.count(),
      db.product.count(),
      db.deal.count({ where: { isApproved: true, endDate: { gt: new Date() } } }),
      db.order.count(),
    ])

    // Top shops by views (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

    const topShopViews = await db.visitorStat.findMany({
      where: {
        entityType: 'shop',
        date: { gte: thirtyDaysAgoStr },
      },
      orderBy: { views: 'desc' },
      take: 10,
    })

    // Enrich top shops with shop data
    const topShops = await Promise.all(
      topShopViews.map(async (stat) => {
        const shop = await db.shop.findUnique({
          where: { id: stat.entityId },
          select: { id: true, name: true, nameAr: true, logo: true, category: true },
        })
        return {
          ...stat,
          shop,
        }
      })
    )

    // Top categories by views
    const topCategoryViews = await db.visitorStat.findMany({
      where: {
        entityType: 'category',
        date: { gte: thirtyDaysAgoStr },
      },
      orderBy: { views: 'desc' },
      take: 10,
    })

    const topCategories = await Promise.all(
      topCategoryViews.map(async (stat) => {
        const category = await db.shopCategory.findUnique({
          where: { id: stat.entityId },
          select: { id: true, name: true, nameAr: true, icon: true, color: true },
        })
        return {
          ...stat,
          category,
        }
      })
    )

    // Top deals by views
    const topDealViews = await db.visitorStat.findMany({
      where: {
        entityType: 'deal',
        date: { gte: thirtyDaysAgoStr },
      },
      orderBy: { views: 'desc' },
      take: 10,
    })

    const topDeals = await Promise.all(
      topDealViews.map(async (stat) => {
        const deal = await db.deal.findUnique({
          where: { id: stat.entityId },
          select: {
            id: true,
            title: true,
            titleAr: true,
            discount: true,
            image: true,
            shop: { select: { id: true, name: true, nameAr: true, logo: true } },
          },
        })
        return {
          ...stat,
          deal,
        }
      })
    )

    return successResponse({
      totals: {
        shops: totalShops,
        products: totalProducts,
        deals: totalDeals,
        orders: totalOrders,
      },
      topShops: topShops.filter((s) => s.shop !== null),
      topCategories: topCategories.filter((c) => c.category !== null),
      topDeals: topDeals.filter((d) => d.deal !== null),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
