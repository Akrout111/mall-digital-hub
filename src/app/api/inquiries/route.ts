import { db } from '@/lib/db'
import { paginatedResponse, successResponse, errorResponse, notFoundResponse, unauthorizedResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { validateBody, createInquirySchema } from '@/lib/validations'

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
    // Must be logged in to create inquiries
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createInquirySchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { shopId, customerId, subject, message } = validation.data

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
