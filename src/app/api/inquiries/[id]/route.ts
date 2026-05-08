import { db } from '@/lib/db'
import { successResponse, notFoundResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { validateBody, replyInquirySchema } from '@/lib/validations'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Must be logged in to reply to inquiries
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(replyInquirySchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { reply, status } = validation.data

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
