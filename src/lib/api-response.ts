// Standardized API response envelope
interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

interface ApiErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function successResponse<T>(data: T, meta?: ApiSuccessResponse<T>['meta']): Response {
  const response: ApiSuccessResponse<T> = { success: true, data }
  if (meta) response.meta = meta
  return Response.json(response)
}

export function paginatedResponse<T>(data: T, page: number, limit: number, total: number): Response {
  const totalPages = Math.ceil(total / limit)
  return successResponse(data, { page, limit, total, totalPages })
}

export function errorResponse(error: string, status: number = 400, errors?: Record<string, string[]>, code?: string): Response {
  const response: ApiErrorResponse = { success: false, error, code }
  if (errors) response.errors = errors
  return Response.json(response, { status })
}

export function notFoundResponse(entity: string): Response {
  return errorResponse(`${entity} غير موجود`, 404, undefined, 'NOT_FOUND')
}

export function unauthorizedResponse(): Response {
  return errorResponse('غير مصرح بهذا الإجراء', 401, undefined, 'UNAUTHORIZED')
}

export function forbiddenResponse(): Response {
  return errorResponse('ليس لديك صلاحية لهذا الإجراء', 403, undefined, 'FORBIDDEN')
}

export function serverErrorResponse(message?: string): Response {
  return errorResponse(message || 'خطأ في الخادم', 500, undefined, 'SERVER_ERROR')
}

// Pagination helper
export function getPaginationParams(searchParams: URLSearchParams): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
