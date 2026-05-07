import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const isApproved = searchParams.get('isApproved')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (isApproved !== null && isApproved !== undefined && isApproved !== '') {
      where.isApproved = isApproved === 'true'
    }

    const deals = await db.deal.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(deals)
  } catch (error) {
    console.error('Error fetching deals for management:', error)
    return Response.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shopId, title, titleAr, description, descriptionAr, discount, originalPrice, salePrice, image, startDate, endDate } = body

    if (!shopId || !title || !startDate || !endDate) {
      return Response.json(
        { error: 'Missing required fields: shopId, title, startDate, endDate' },
        { status: 400 }
      )
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return Response.json({ error: 'Shop not found' }, { status: 404 })
    }

    const deal = await db.deal.create({
      data: {
        shopId,
        title,
        titleAr: titleAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        discount: discount ?? null,
        originalPrice: originalPrice ?? null,
        salePrice: salePrice ?? null,
        image: image || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isApproved: false,
        isFeatured: false,
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
      },
    })

    return Response.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return Response.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, isApproved, isFeatured } = body

    if (!id) {
      return Response.json({ error: 'Missing deal id' }, { status: 400 })
    }

    const existingDeal = await db.deal.findUnique({ where: { id } })
    if (!existingDeal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (isApproved !== undefined) data.isApproved = isApproved
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const deal = await db.deal.update({
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
      },
    })

    return Response.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return Response.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}
