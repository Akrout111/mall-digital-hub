import { db } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAdmin } from '@/lib/auth-middleware'
import { validateBody, updateSubscriptionSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    const where: Record<string, unknown> = {}
    if (shopId) {
      where.shopId = shopId
    }

    const subscriptions = await db.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Enrich with shop data
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const shop = await db.shop.findUnique({
          where: { id: sub.shopId },
          select: { id: true, name: true, nameAr: true, logo: true },
        })
        return { ...sub, shop }
      })
    )

    return successResponse(enriched)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    // Only admins can change subscription tiers
    const session = await requireAdmin()
    if (!session) {
      return forbiddenResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(updateSubscriptionSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { shopId, tier } = validation.data

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    // Upsert subscription
    const subscription = await db.subscription.upsert({
      where: { shopId },
      update: {
        tier,
        isActive: true,
        startDate: new Date(),
      },
      create: {
        shopId,
        tier,
        isActive: true,
        startDate: new Date(),
      },
    })

    // Also update shop's subscriptionTier
    await db.shop.update({
      where: { id: shopId },
      data: { subscriptionTier: tier },
    })

    return successResponse({ ...subscription, shop: { id: shop.id, name: shop.name, nameAr: shop.nameAr, logo: shop.logo } })
  } catch (error) {
    return handleApiError(error)
  }
}
