import { db } from '@/lib/db'
import { successResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

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

    return successResponse(banners)
  } catch (error) {
    return handleApiError(error)
  }
}
