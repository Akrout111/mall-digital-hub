import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const inStock = searchParams.get('inStock')

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (inStock !== null && inStock !== undefined && inStock !== '') {
      where.inStock = inStock === 'true'
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    })

    return Response.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
