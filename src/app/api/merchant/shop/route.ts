import { db } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return errorResponse('Missing required query param: ownerId', 400, undefined, 'VALIDATION_ERROR')
    }

    const shop = await db.shop.findUnique({
      where: { ownerId },
      include: {
        category: true,
        tags: true,
        products: {
          include: { category: true },
          orderBy: { name: 'asc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    image: true,
                    price: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        inquiries: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!shop) {
      return notFoundResponse('Shop')
    }

    return successResponse(shop)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { ownerId, name, description, phone, email, openTime, closeTime, isOpen } = body

    if (!ownerId) {
      return errorResponse('Missing required field: ownerId', 400, undefined, 'VALIDATION_ERROR')
    }

    const shop = await db.shop.findUnique({ where: { ownerId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email
    if (openTime !== undefined) data.openTime = openTime
    if (closeTime !== undefined) data.closeTime = closeTime
    if (isOpen !== undefined) data.isOpen = isOpen

    const updatedShop = await db.shop.update({
      where: { id: shop.id },
      data,
      include: {
        category: true,
        tags: true,
      },
    })

    return successResponse(updatedShop)
  } catch (error) {
    return handleApiError(error)
  }
}
