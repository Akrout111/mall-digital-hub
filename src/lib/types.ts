// Mall Digital Hub - Shared Types

export interface MallInfo {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  address: string;
  addressAr: string;
  phone: string;
  email: string;
  floors: number;
  openTime: string;
  closeTime: string;
  logo: string;
  shopCount?: number;
  categoryCount?: number;
  dealCount?: number;
}

export interface ShopCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  _count?: { shops: number };
  shopCount?: number;
}

export interface Shop {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  categoryId: string;
  mallId: string;
  ownerId: string;
  floor: number;
  shopNumber: string;
  phone: string;
  email: string;
  logo: string;
  coverImage: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  subscriptionTier: string;
  category?: ShopCategory;
  tags?: ShopTag[];
  deals?: Deal[];
  products?: Product[];
  _count?: { deals: number; products: number };
}

export interface ShopTag {
  id: string;
  shopId: string;
  tag: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  categoryId: string;
  shopId: string;
  inStock: boolean;
  unit: string;
  category?: ProductCategory;
  shop?: Shop;
}

export interface Deal {
  id: string;
  shopId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  image: string;
  startDate: string;
  endDate: string;
  isApproved: boolean;
  isFeatured: boolean;
  shop?: Shop;
}

export interface Banner {
  id: string;
  mallId: string;
  title: string;
  titleAr: string;
  image: string;
  link: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}

export interface CartItem {
  productId: string;
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  image?: string;
  unit: string;
  shopId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  status: 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled';
  total: number;
  notes: string;
  collectedAt: string;
  createdAt: string;
  items?: OrderItem[];
  shop?: Shop;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Inquiry {
  id: string;
  shopId: string;
  customerId: string;
  subject: string;
  message: string;
  status: 'open' | 'replied' | 'closed';
  reply: string;
  createdAt: string;
  shop?: Shop;
}

export interface Subscription {
  id: string;
  shopId: string;
  tier: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  shop?: Shop;
}

export interface VisitorStat {
  id: string;
  entityType: string;
  entityId: string;
  views: number;
  date: string;
}

export interface DashboardStats {
  totalShops: number;
  totalProducts: number;
  totalDeals: number;
  totalOrders: number;
  totalRevenue: number;
  topShops: { id: string; name: string; nameAr: string; views: number }[];
  topCategories: { id: string; name: string; nameAr: string; views: number }[];
  recentOrders: Order[];
  pendingDeals: Deal[];
}
