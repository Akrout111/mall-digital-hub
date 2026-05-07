import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = {
      isApproved: true,
      endDate: { gt: new Date() },
    }

    if (shopId) {
      where.shopId = shopId
    }

    if (category) {
      where.shop = { categoryId: category }
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      where.isFeatured = featured === 'true'
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return Response.json(deals)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return Response.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}
