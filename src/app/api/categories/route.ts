import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.shopCategory.findMany({
      include: {
        _count: {
          select: { shops: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
