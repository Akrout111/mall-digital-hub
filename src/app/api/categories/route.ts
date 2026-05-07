import { db } from '@/lib/db'
import { successResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

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

    return successResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}
