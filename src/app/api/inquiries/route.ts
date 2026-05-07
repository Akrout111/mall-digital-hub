import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (status) {
      where.status = status
    }

    const inquiries = await db.inquiry.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(inquiries)
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return Response.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopId, customerId, subject, message } = body

    if (!shopId || !customerId || !subject || !message) {
      return Response.json(
        { error: 'Missing required fields: shopId, customerId, subject, message' },
        { status: 400 }
      )
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Verify customer exists
    const customer = await db.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    const inquiry = await db.inquiry.create({
      data: {
        shopId,
        customerId,
        subject,
        message,
        status: 'open',
      },
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

    return Response.json(inquiry, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return Response.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}
