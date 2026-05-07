import { db } from '@/lib/db'
import { successResponse, notFoundResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET() {
  try {
    const mall = await db.mall.findFirst()
    if (!mall) {
      return notFoundResponse('Mall')
    }

    const [shopCount, categoryCount, dealCount] = await Promise.all([
      db.shop.count({ where: { mallId: mall.id } }),
      db.shopCategory.count(),
      db.deal.count({ where: { isApproved: true, endDate: { gt: new Date() } } }),
    ])

    return successResponse({
      ...mall,
      shopCount,
      categoryCount,
      dealCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
