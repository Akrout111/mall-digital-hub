import { db } from '@/lib/db'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { requireAdmin } from '@/lib/auth-middleware'
import { validateBody, createBannerSchema } from '@/lib/validations'

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

export async function POST(request: Request) {
  try {
    // Only admins can create banners
    const session = await requireAdmin()
    if (!session) {
      return forbiddenResponse()
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createBannerSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { title, titleAr, image, link, startDate, endDate, priority } = validation.data

    // Get the first mall (or create a default mallId)
    const mall = await db.mall.findFirst()
    if (!mall) {
      return errorResponse('No mall found in database', 500, undefined, 'SERVER_ERROR')
    }

    const banner = await db.banner.create({
      data: {
        mallId: mall.id,
        title,
        titleAr: titleAr || null,
        image,
        link: link || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priority: priority ?? 0,
      },
    })

    return successResponse(banner)
  } catch (error) {
    return handleApiError(error)
  }
}
