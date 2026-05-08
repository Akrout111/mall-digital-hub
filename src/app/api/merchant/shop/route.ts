import { db } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAuth, requireMerchant } from '@/lib/auth-middleware'
import { validateBody, updateShopSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    // Must be logged in to view shop details
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

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
    // Only merchants can update their shop
    const session = await requireMerchant()
    if (!session) {
      return forbiddenResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(updateShopSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { ownerId, name, nameAr, description, descriptionAr, phone, email, openTime, closeTime, isOpen } = validation.data

    const shop = await db.shop.findUnique({ where: { ownerId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    // Verify that the shop's ownerId matches the logged-in user's ID
    const userId = (session.user as Record<string, unknown>).id as string
    if (shop.ownerId !== userId) {
      return forbiddenResponse()
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (nameAr !== undefined) data.nameAr = nameAr
    if (description !== undefined) data.description = description
    if (descriptionAr !== undefined) data.descriptionAr = descriptionAr
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
