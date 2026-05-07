import { ZodError } from 'zod'
import { errorResponse, serverErrorResponse } from './api-response'

export function handleApiError(error: unknown): Response {
  // Log the error (in production, send to monitoring service)
  console.error('[API Error]', error)
  
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    error.issues.forEach((err) => {
      const key = err.path.join('.') || '_root'
      if (!errors[key]) errors[key] = []
      errors[key].push(err.message)
    })
    return errorResponse('بيانات غير صالحة', 400, errors, 'VALIDATION_ERROR')
  }
  
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    if (error.message.includes('not found') || error.message.includes('غير موجود')) {
      return errorResponse(error.message, 404, undefined, 'NOT_FOUND')
    }
    return errorResponse(error.message, 400)
  }
  
  return serverErrorResponse()
}
