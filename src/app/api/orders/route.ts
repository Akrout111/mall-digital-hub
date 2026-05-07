import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
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

    const orders = await db.order.findMany({
      where,
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
    })

    return Response.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, shopId, items, notes } = body

    if (!customerId || !shopId || !items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { error: 'Missing required fields: customerId, shopId, items' },
        { status: 400 }
      )
    }

    // Validate each item has productId and quantity
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return Response.json(
          { error: 'Each item must have a productId and quantity >= 1' },
          { status: 400 }
        )
      }
    }

    // Verify customer exists
    const customer = await db.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Fetch all products to validate and calculate total
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, shopId },
    })

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id)
      const missingIds = productIds.filter((id: string) => !foundIds.includes(id))
      return Response.json(
        { error: `Products not found or don't belong to this shop: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate stock availability and calculate total
    let total = 0
    const orderItemsData: { productId: string; quantity: number; price: number }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return Response.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      if (!product.inStock) {
        return Response.json(
          { error: `Product "${product.name}" is out of stock` },
          { status: 400 }
        )
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

    return Response.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
