import { db } from '@/lib/db'
import { paginatedResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const shopId = searchParams.get('shopId')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = {
      isApproved: true,
      endDate: { gt: new Date() },
    }

    if (shopId) {
      where.shopId = shopId
    }

    if (category) {
      where.shop = { categoryId: category }
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      where.isFeatured = featured === 'true'
    }

    const [deals, total] = await Promise.all([
      db.deal.findMany({
        where,
        skip,
        take: limit,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              logo: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      db.deal.count({ where }),
    ])

    return paginatedResponse(deals, page, limit, total)
  } catch (error) {
    return handleApiError(error)
  }
}
