import { db } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reply, status } = body

    if (!reply && !status) {
      return errorResponse('Must provide at least a reply or status update', 400, undefined, 'VALIDATION_ERROR')
    }

    const existingInquiry = await db.inquiry.findUnique({ where: { id } })
    if (!existingInquiry) {
      return notFoundResponse('Inquiry')
    }

    const data: Record<string, unknown> = {}
    if (reply) {
      data.reply = reply
      data.status = 'replied'
    }
    if (status) {
      const validStatuses = ['open', 'replied', 'closed']
      if (!validStatuses.includes(status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400)
      }
      data.status = status
    }

    const inquiry = await db.inquiry.update({
      where: { id },
      data,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            logo: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(inquiry)
  } catch (error) {
    return handleApiError(error)
  }
}
