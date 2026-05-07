import { db } from '@/lib/db'
import { successResponse, notFoundResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

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
      return notFoundResponse('Shop')
    }

    return successResponse(shop)
  } catch (error) {
    return handleApiError(error)
  }
}
