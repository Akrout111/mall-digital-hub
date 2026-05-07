import { z } from "zod"

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
})

// Inquiry schemas
export const createInquirySchema = z.object({
  shopId: z.string().min(1, "معرف المتجر مطلوب"),
  customerId: z.string().min(1, "معرف العميل مطلوب"),
  subject: z
    .string()
    .min(3, "الموضوع يجب أن يكون 3 أحرف على الأقل")
    .max(100),
  message: z
    .string()
    .min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل")
    .max(1000),
})

export const replyInquirySchema = z.object({
  reply: z.string().min(5, "الرد يجب أن يكون 5 أحرف على الأقل"),
  status: z.enum(["open", "replied", "closed"]),
})

// Order schemas
export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  shopId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "الطلب يجب أن يحتوي على عنصر واحد على الأقل"),
  notes: z.string().max(500).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "collected", "cancelled"]),
})

// Deal schemas
export const createDealSchema = z.object({
  shopId: z.string().min(1),
  title: z.string().min(3).max(100),
  titleAr: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionAr: z.string().max(500).optional(),
  discount: z.number().int().min(0).max(100).optional(),
  originalPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  image: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const updateDealSchema = z.object({
  id: z.string().min(1),
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

// Shop update schema
export const updateShopSchema = z.object({
  ownerId: z.string().min(1),
  name: z.string().min(2).max(100).optional(),
  nameAr: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionAr: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  isOpen: z.boolean().optional(),
})

// Subscription schema
export const updateSubscriptionSchema = z.object({
  shopId: z.string().min(1),
  tier: z.enum(["free", "premium"]),
})

// Visit tracking schema
export const trackVisitSchema = z.object({
  entityType: z.enum(["shop", "category", "deal"]),
  entityId: z.string().min(1),
})

// Banner schema
export const createBannerSchema = z.object({
  title: z.string().min(2).max(100),
  titleAr: z.string().min(2).max(100).optional(),
  image: z.string().min(1),
  link: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  priority: z.number().int().min(0).optional(),
})

// Helper to validate request body
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string[]> = {}
  result.error.issues.forEach((err) => {
    const key = err.path.join(".") || "_root"
    if (!errors[key]) errors[key] = []
    errors[key].push(err.message)
  })
  return { success: false, errors }
}
