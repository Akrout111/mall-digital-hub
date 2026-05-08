import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { validateBody, trackVisitSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(trackVisitSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { entityType, entityId } = validation.data

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
