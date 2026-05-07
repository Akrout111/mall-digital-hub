import { db } from '@/lib/db'
import { paginatedResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const floor = searchParams.get('floor')
    const isOpen = searchParams.get('isOpen')
    const subscriptionTier = searchParams.get('subscriptionTier')

    const where: Record<string, unknown> = {}

    if (category) {
      where.categoryId = category
    }

    if (floor) {
      where.floor = parseInt(floor, 10)
    }

    if (isOpen !== null && isOpen !== undefined && isOpen !== '') {
      where.isOpen = isOpen === 'true'
    }

    if (subscriptionTier) {
      where.subscriptionTier = subscriptionTier
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { tags: { some: { tag: { contains: search } } } },
      ]
    }

    const [shops, total] = await Promise.all([
      db.shop.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          tags: true,
          _count: {
            select: { deals: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.shop.count({ where }),
    ])

    return paginatedResponse(shops, page, limit, total)
  } catch (error) {
    return handleApiError(error)
  }
}
