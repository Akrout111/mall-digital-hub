import { db } from '@/lib/db'
import { validateBody, createDealSchema, updateDealSchema } from '@/lib/validations'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { requireAdmin, requireMerchant } from '@/lib/auth-middleware'
import { unauthorizedResponse, forbiddenResponse, successResponse, notFoundResponse, errorResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    // Only admins can see all deals including unapproved
    const session = await requireAdmin()
    if (!session) {
      return forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const isApproved = searchParams.get('isApproved')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (isApproved !== null && isApproved !== undefined && isApproved !== '') {
      where.isApproved = isApproved === 'true'
    }

    const deals = await db.deal.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(deals)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    // Only merchants can create deals
    const session = await requireMerchant()
    if (!session) {
      return unauthorizedResponse()
    }

    // Rate limiting - prevent spam deal creation
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateResult = rateLimit(`deal:${clientIp}`)
    const rateHeaders = getRateLimitHeaders(rateResult)

    if (!rateResult.allowed) {
      return errorResponse('Too many requests. Please try again later.', 429, undefined, 'RATE_LIMITED')
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createDealSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { shopId, title, titleAr, description, descriptionAr, discount, originalPrice, salePrice, image, startDate, endDate } = validation.data

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    const deal = await db.deal.create({
      data: {
        shopId,
        title,
        titleAr: titleAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        discount: discount ?? null,
        originalPrice: originalPrice ?? null,
        salePrice: salePrice ?? null,
        image: image || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isApproved: false,
        isFeatured: false,
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
      },
    })

    return successResponse(deal)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    // Only admins can approve/reject/feature deals
    const session = await requireAdmin()
    if (!session) {
      return forbiddenResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(updateDealSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { id, isApproved, isFeatured } = validation.data

    const existingDeal = await db.deal.findUnique({ where: { id } })
    if (!existingDeal) {
      return notFoundResponse('Deal')
    }

    const data: Record<string, unknown> = {}
    if (isApproved !== undefined) data.isApproved = isApproved
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const deal = await db.deal.update({
      where: { id },
      data,
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
    })

    return successResponse(deal)
  } catch (error) {
    return handleApiError(error)
  }
}
