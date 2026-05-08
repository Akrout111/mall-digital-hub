import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { createPaymentIntent, verifyPayment } from '@/lib/payment'
import { z } from 'zod'

const createPaymentSchema = z.object({
  orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().default('SAR'),
})

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const body = await request.json()

    // Validate
    const validation = createPaymentSchema.safeParse(body)
    if (!validation.success) {
      const errors: Record<string, string[]> = {}
      validation.error.issues.forEach((err) => {
        const key = err.path.join('.') || '_root'
        if (!errors[key]) errors[key] = []
        errors[key].push(err.message)
      })
      return errorResponse('بيانات غير صالحة', 400, errors, 'VALIDATION_ERROR')
    }

    const { orderId, amount, currency } = validation.data

    // Create payment intent
    const result = await createPaymentIntent({
      amount,
      currency,
      orderId,
      customerId: (session.user as Record<string, unknown>).id as string,
    })

    if (!result.success) {
      return errorResponse(result.error || 'فشل في إنشاء عملية الدفع', 400)
    }

    return successResponse({
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl,
      status: 'pending',
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: Request) {
  try {
    // Auth check
    const session = await requireAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return errorResponse('معرف عملية الدفع مطلوب', 400, undefined, 'VALIDATION_ERROR')
    }

    const payment = await verifyPayment(paymentId)
    if (!payment) {
      return errorResponse('عملية الدفع غير موجودة', 404, undefined, 'NOT_FOUND')
    }

    return successResponse(payment)
  } catch (error) {
    return handleApiError(error)
  }
}
