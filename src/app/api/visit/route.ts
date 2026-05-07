import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { entityType, entityId } = body

    if (!entityType || !entityId) {
      return Response.json(
        { error: 'Missing required fields: entityType, entityId' },
        { status: 400 }
      )
    }

    const validEntityTypes = ['shop', 'category', 'deal']
    if (!validEntityTypes.includes(entityType)) {
      return Response.json(
        { error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // Upsert visitor stat - increment views for today
    const stat = await db.visitorStat.upsert({
      where: {
        entityType_entityId_date: {
          entityType,
          entityId,
          date: today,
        },
      },
      update: {
        views: { increment: 1 },
      },
      create: {
        entityType,
        entityId,
        date: today,
        views: 1,
      },
    })

    return Response.json(stat, { status: 201 })
  } catch (error) {
    console.error('Error tracking visit:', error)
    return Response.json({ error: 'Failed to track visit' }, { status: 500 })
  }
}
