import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()

    const banners = await db.banner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { priority: 'desc' },
    })

    return Response.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return Response.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
