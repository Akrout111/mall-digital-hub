import { db } from '@/lib/db'

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

    return Response.json(enriched)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return Response.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { shopId, tier, endDate } = body

    if (!shopId || !tier) {
      return Response.json(
        { error: 'Missing required fields: shopId, tier' },
        { status: 400 }
      )
    }

    const validTiers = ['free', 'premium']
    if (!validTiers.includes(tier)) {
      return Response.json(
        { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Upsert subscription
    const subscription = await db.subscription.upsert({
      where: { shopId },
      update: {
        tier,
        isActive: true,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      create: {
        shopId,
        tier,
        isActive: true,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    // Also update shop's subscriptionTier
    await db.shop.update({
      where: { id: shopId },
      data: { subscriptionTier: tier },
    })

    return Response.json({ ...subscription, shop: { id: shop.id, name: shop.name, nameAr: shop.nameAr, logo: shop.logo } })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return Response.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
