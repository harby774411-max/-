export type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal' | 'all';
export type SkinGoal = 'glow' | 'hydration' | 'whitening' | 'anti_aging' | 'barrier_repair' | 'protection' | 'cleansing';

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  productId?: string;
  nameAr: string;
  nameEn: string;
  shortDescriptionAr?: string;
  descriptionAr: string;
  descriptionEn?: string;
  benefits?: string[];
  ingredients?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  usage?: string;
  usageAr?: string;
  precautionsAr?: string;
  size?: string; // e.g. "50ml", "100ml"
  skinTypes?: string[];
  skinType?: SkinType | string;
  concern?: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  priceBefore?: number | null;
  discountPercent?: number;
  imageUrl?: string;
  gallery?: string[];
  images: string[];
  stock: number;
  lowStockThreshold?: number;
  published?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  badge?: string;
  rating: number;
  reviewsCount: number;
  goal?: SkinGoal | string;
  step?: 'cleanser' | 'moisturizer' | 'sunscreen' | 'serum' | 'mask' | 'treatment' | string;
  recommendationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image?: string;
  description?: string;
}

export type OrderStatus = 
  | 'new'            // جديد
  | 'review'         // قيد المراجعة
  | 'confirmed'      // تم التأكيد
  | 'preparing'      // قيد التجهيز
  | 'shipping'       // خرج للتوصيل
  | 'delivered'      // تم التسليم
  | 'cancelled'      // ملغي
  | 'returned';      // مُعاد

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "WED-2026-1042"
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  expressFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  customerName: string;
  customerPhone: string;
  governorate: string;
  area: string;
  addressDetails: string;
  deliveryNotes?: string;
  deliveryDate: string; // e.g. "2026-08-27"
  deliveryType: 'standard' | 'express'; // 24h standard vs 12h express (+fee)
  paymentMethod: 'cash' | 'transfer_kuraimi' | 'transfer_floosak' | 'transfer_onecash' | string;
  status: OrderStatus | string;
  statusHistory?: OrderStatusHistoryItem[];
  // Birthday / Surprise Consent System
  birthdayConsent?: boolean;
  birthdayDay?: number;
  birthdayMonth?: number;
  birthdayYear?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  governorate?: string;
  area?: string;
  birthdayConsent?: boolean;
  birthdayDay?: number;
  birthdayMonth?: number;
  birthdayYear?: number;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BirthdayEvent {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  eventYear: number;
  eventMonth: number;
  eventDay: number;
  preparationStatus: 'pending' | 'prepared' | 'sent';
  cardStatus: 'pending' | 'printed';
  giftStatus: 'pending' | 'packaged';
  whatsappStatus: 'pending' | 'sent';
  sentAt?: string | null;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
  startsAt?: string;
  usageLimit?: number;
  timesUsed?: number;
}

export interface AiTrainingRule {
  id: string;
  title: string;
  keywords: string;
  questionExample: string;
  response: string;
  recommendedProductIds: string[];
  category: 'skin_concerns' | 'routines' | 'products' | 'shipping_payment' | 'safety_pregnancy' | 'general';
  isActive: boolean;
  order?: number;
}


export type AdminRole = 'owner' | 'product_manager' | 'orders_officer' | 'courier';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
}
