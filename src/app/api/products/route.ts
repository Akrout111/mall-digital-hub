import { db } from '@/lib/db'
import { paginatedResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const shopId = searchParams.get('shopId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const inStock = searchParams.get('inStock')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (inStock !== null && inStock !== undefined && inStock !== '') {
      where.inStock = inStock === 'true'
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
      }),
      db.product.count({ where }),
    ])

    return paginatedResponse(products, page, limit, total)
  } catch (error) {
    return handleApiError(error)
  }
}
