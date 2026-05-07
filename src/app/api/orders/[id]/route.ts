import { db } from '@/lib/db'

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
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
                unit: true,
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
            phone: true,
            email: true,
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
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return Response.json({ error: 'Missing required field: status' }, { status: 400 })
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'collected', 'cancelled']
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const existingOrder = await db.order.findUnique({ where: { id } })
    if (!existingOrder) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[existingOrder.status]
    if (!allowedTransitions.includes(status)) {
      return Response.json(
        { error: `Cannot transition from "${existingOrder.status}" to "${status}". Allowed transitions: ${allowedTransitions.join(', ') || 'none'}` },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = { status }
    if (status === 'collected') {
      data.collectedAt = new Date()
    }

    const order = await db.order.update({
      where: { id },
      data,
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

    return Response.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
