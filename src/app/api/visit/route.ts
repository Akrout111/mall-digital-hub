import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { entityType, entityId } = body

    if (!entityType || !entityId) {
      return errorResponse('Missing required fields: entityType, entityId', 400, undefined, 'VALIDATION_ERROR')
    }

    const validEntityTypes = ['shop', 'category', 'deal']
    if (!validEntityTypes.includes(entityType)) {
      return errorResponse(`Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`, 400)
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

    return successResponse(stat)
  } catch (error) {
    return handleApiError(error)
  }
}
