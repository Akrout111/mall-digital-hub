import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        products: {
          include: { category: true },
          orderBy: { name: 'asc' },
        },
        deals: {
          where: { isApproved: true, endDate: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 })
    }

    return Response.json(shop)
  } catch (error) {
    console.error('Error fetching shop:', error)
    return Response.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}
