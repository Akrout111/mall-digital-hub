import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return Response.json({ error: 'Missing required query param: ownerId' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({
      where: { ownerId },
      include: {
        category: true,
        tags: true,
        products: {
          include: { category: true },
          orderBy: { name: 'asc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
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
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        inquiries: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!shop) {
      return Response.json({ error: 'Shop not found for this owner' }, { status: 404 })
    }

    return Response.json(shop)
  } catch (error) {
    console.error('Error fetching merchant shop:', error)
    return Response.json({ error: 'Failed to fetch merchant shop' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { ownerId, name, description, phone, email, openTime, closeTime, isOpen } = body

    if (!ownerId) {
      return Response.json({ error: 'Missing required field: ownerId' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { ownerId } })
    if (!shop) {
      return Response.json({ error: 'Shop not found for this owner' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email
    if (openTime !== undefined) data.openTime = openTime
    if (closeTime !== undefined) data.closeTime = closeTime
    if (isOpen !== undefined) data.isOpen = isOpen

    const updatedShop = await db.shop.update({
      where: { id: shop.id },
      data,
      include: {
        category: true,
        tags: true,
      },
    })

    return Response.json(updatedShop)
  } catch (error) {
    console.error('Error updating merchant shop:', error)
    return Response.json({ error: 'Failed to update merchant shop' }, { status: 500 })
  }
}
