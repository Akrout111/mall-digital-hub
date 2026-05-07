import { db } from '@/lib/db'
import { paginatedResponse, successResponse, errorResponse, notFoundResponse, getPaginationParams } from '@/lib/api-response'
import { handleApiError } from '@/lib/error-handler'
import { validateBody, createOrderSchema } from '@/lib/validations'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const customerId = searchParams.get('customerId')
    const shopId = searchParams.get('shopId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (customerId) {
      where.customerId = customerId
    }

    if (shopId) {
      where.shopId = shopId
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
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
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ])

    return paginatedResponse(orders, page, limit, total)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting - prevent spam orders
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateResult = rateLimit(`order:${clientIp}`)
    const rateHeaders = getRateLimitHeaders(rateResult)

    if (!rateResult.allowed) {
      return errorResponse('Too many requests. Please try again later.', 429, undefined, 'RATE_LIMITED')
    }

    const body = await request.json()

    // Validate with Zod
    const validation = validateBody(createOrderSchema, body)
    if (!validation.success) {
      return errorResponse('بيانات غير صالحة', 400, validation.errors, 'VALIDATION_ERROR')
    }

    const { customerId, shopId, items, notes } = validation.data

    // Verify customer exists
    const customer = await db.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return notFoundResponse('Customer')
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return notFoundResponse('Shop')
    }

    // Fetch all products to validate and calculate total
    const productIds = items.map((item) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, shopId },
    })

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id)
      const missingIds = productIds.filter((id) => !foundIds.includes(id))
      return errorResponse(`Products not found or don't belong to this shop: ${missingIds.join(', ')}`, 400)
    }

    // Validate stock availability and calculate total
    let total = 0
    const orderItemsData: { productId: string; quantity: number; price: number }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return notFoundResponse('Product')
      }

      if (!product.inStock) {
        return errorResponse(`Product "${product.name}" is out of stock`, 400)
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })
    }

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId,
          shopId,
          total,
          notes: notes || null,
          status: 'pending',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
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

      return newOrder
    })

    return successResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}
