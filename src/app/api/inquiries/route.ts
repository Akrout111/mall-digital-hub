import { db } from '@/lib/db'
import { paginatedResponse, successResponse, errorResponse, notFoundResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const shopId = searchParams.get('shopId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (status) {
      where.status = status
    }

    const [inquiries, total] = await Promise.all([
      db.inquiry.findMany({
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
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.inquiry.count({ where }),
    ])

    return paginatedResponse(inquiries, page, limit, total)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopId, customerId, subject, message } = body

    if (!shopId || !customerId || !subject || !message) {
      return errorResponse('Missing required fields: shopId, customerId, subject, message', 400, undefined, 'VALIDATION_ERROR')
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    // Verify customer exists
    const customer = await db.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return notFoundResponse('Customer')
    }

    const inquiry = await db.inquiry.create({
      data: {
        shopId,
        customerId,
        subject,
        message,
        status: 'open',
      },
      include: {
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

    return successResponse(inquiry)
  } catch (error) {
    return handleApiError(error)
  }
}
