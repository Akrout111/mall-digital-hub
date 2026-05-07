import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const floor = searchParams.get('floor')
    const isOpen = searchParams.get('isOpen')
    const subscriptionTier = searchParams.get('subscriptionTier')

    const where: Record<string, unknown> = {}

    if (category) {
      where.categoryId = category
    }

    if (floor) {
      where.floor = parseInt(floor, 10)
    }

    if (isOpen !== null && isOpen !== undefined && isOpen !== '') {
      where.isOpen = isOpen === 'true'
    }

    if (subscriptionTier) {
      where.subscriptionTier = subscriptionTier
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { tags: { some: { tag: { contains: search } } } },
      ]
    }

    const shops = await db.shop.findMany({
      where,
      include: {
        category: true,
        tags: true,
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return Response.json(shops)
  } catch (error) {
    console.error('Error fetching shops:', error)
    return Response.json({ error: 'Failed to fetch shops' }, { status: 500 })
  }
}
