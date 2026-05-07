import { db } from '@/lib/db'

export async function GET() {
  try {
    const mall = await db.mall.findFirst()
    if (!mall) {
      return Response.json({ error: 'Mall not found' }, { status: 404 })
    }

    const [shopCount, categoryCount, dealCount] = await Promise.all([
      db.shop.count({ where: { mallId: mall.id } }),
      db.shopCategory.count(),
      db.deal.count({ where: { isApproved: true, endDate: { gt: new Date() } } }),
    ])

    return Response.json({
      ...mall,
      shopCount,
      categoryCount,
      dealCount,
    })
  } catch (error) {
    console.error('Error fetching mall info:', error)
    return Response.json({ error: 'Failed to fetch mall info' }, { status: 500 })
  }
}
