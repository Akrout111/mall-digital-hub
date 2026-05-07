import { db } from '@/lib/db'
import { successResponse, notFoundResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            logo: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!product) {
      return notFoundResponse('Product')
    }

    return successResponse(product)
  } catch (error) {
    return handleApiError(error)
  }
}
