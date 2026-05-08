import { db } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { validateBody, updateOrderStatusSchema } from '@/lib/validations'
import { requireAuth } from '@/lib/auth-middleware'

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
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
                unit: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            logo: true,
            phone: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return notFoundResponse('Order')
    }

    return successResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Must be logged in to update order status
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(updateOrderStatusSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { status } = validation.data

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { shop: { select: { ownerId: true } } },
    })
    if (!existingOrder) {
      return notFoundResponse('Order')
    }

    // Verify the user is either the merchant of that shop or an admin
    const userId = (session.user as Record<string, unknown>).id as string
    const userRole = (session.user as Record<string, unknown>).role as string
    const isMerchantOfShop = existingOrder.shop.ownerId === userId
    const isAdmin = userRole === 'admin'

    if (!isMerchantOfShop && !isAdmin) {
      return forbiddenResponse()
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[existingOrder.status]
    if (!allowedTransitions.includes(status)) {
      return errorResponse(
        `Cannot transition from "${existingOrder.status}" to "${status}". Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
        400
      )
    }

    const data: Record<string, unknown> = { status }
    if (status === 'collected') {
      data.collectedAt = new Date()
    }

    const order = await db.order.update({
      where: { id },
      data,
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
        shop: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            logo: true,
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
    })

    return successResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}
