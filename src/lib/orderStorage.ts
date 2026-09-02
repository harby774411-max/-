import { supabase } from './supabase';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface StoreOrder {
  id: string;
  order_id?: string;
  orderNumber?: string;
  seq_num?: number;
  customer_name: string;
  customerName?: string;
  phone: string;
  address: string;
  city?: string;
  notes?: string;
  delivery_slot?: string;
  shipping_method?: string;
  payment_method?: string;
  subtotal?: number;
  discount?: number;
  coupon_code?: string;
  delivery_fee?: number;
  total: number;
  status: string;
  created_at: string;
  createdAt?: string;
  items: OrderItem[];
  customer_birthday?: string;
}

const LOCAL_STORAGE_KEY = 'wed_store_orders';
const LEGACY_STORAGE_KEY = 'wed_orders';
const SEQUENCE_KEY = 'wed_order_sequence_counter';

/**
 * Parses integer number from sequential order ID like 'وِد-001' or 'WED-002' or 3
 */
export function extractOrderSeqNumber(orderIdOrNumber: any): number {
  if (!orderIdOrNumber) return 1;
  if (typeof orderIdOrNumber === 'number') return orderIdOrNumber;
  const str = String(orderIdOrNumber);
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

/**
 * Formats a sequence number into the requested standard ID: وِد-001, وِد-002, ...
 */
export function formatOrderSequenceId(num: number): string {
  const padded = String(num).padStart(3, '0');
  return `وِد-${padded}`;
}

export const formatSequentialOrderId = formatOrderSequenceId;

/**
 * Gets all locally saved orders from localStorage
 */
export function getLocalOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    
    let combined: StoreOrder[] = [];
    if (raw) {
      combined = JSON.parse(raw);
    }
    if (legacy) {
      const legList: StoreOrder[] = JSON.parse(legacy);
      legList.forEach(lo => {
        if (!combined.some(c => c.id === lo.id)) {
          combined.push(lo);
        }
      });
    }
    return combined;
  } catch (e) {
    return [];
  }
}

/**
 * Computes the next sequential ID based on all known orders and counter
 */
export async function getNextOrderSequenceNumber(): Promise<number> {
  const localOrders = getLocalOrders();
  let maxLocal = 0;
  localOrders.forEach(o => {
    const num = extractOrderSeqNumber(o.id || o.order_id);
    if (num > maxLocal) maxLocal = num;
  });

  const storedCounter = parseInt(localStorage.getItem(SEQUENCE_KEY) || '0', 10);
  let nextNum = Math.max(maxLocal, storedCounter) + 1;

  // Non-blocking query with short timeout
  try {
    const fetchPromise = supabase.from('orders').select('id, created_at').order('created_at', { ascending: false }).limit(10);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 300));
    const result: any = await Promise.race([fetchPromise, timeoutPromise]);
    if (result && result.data && result.data.length > 0) {
      result.data.forEach((o: any) => {
        const num = extractOrderSeqNumber(o.id);
        if (num >= nextNum) {
          nextNum = num + 1;
        }
      });
    }
  } catch (e) {
    // offline or fast fallback
  }

  return nextNum;
}

/**
 * Saves a newly placed order persistently and updates the counter
 */
export async function createAndPersistOrder(payload: {
  customer_name: string;
  phone: string;
  address: string;
  city?: string;
  notes?: string;
  delivery_slot?: string;
  shipping_method?: string;
  payment_method?: string;
  subtotal?: number;
  discount?: number;
  coupon_code?: string;
  delivery_fee?: number;
  total: number;
  items: OrderItem[];
  customer_birthday?: string;
}): Promise<StoreOrder> {
  const nextNum = await getNextOrderSequenceNumber();
  const sequentialId = formatOrderSequenceId(nextNum);

  const newOrder: StoreOrder = {
    id: sequentialId,
    order_id: sequentialId,
    orderNumber: sequentialId,
    customer_name: payload.customer_name,
    customerName: payload.customer_name,
    phone: payload.phone,
    address: payload.address,
    city: payload.city || 'صنعاء',
    notes: payload.notes || '',
    delivery_slot: payload.delivery_slot || 'اليوم - الفترة المسائية',
    shipping_method: payload.shipping_method || 'sanaa_standard',
    payment_method: payload.payment_method || 'cash',
    subtotal: payload.subtotal,
    discount: payload.discount,
    coupon_code: payload.coupon_code,
    delivery_fee: payload.delivery_fee,
    total: payload.total,
    status: 'pending',
    created_at: new Date().toISOString(),
    items: payload.items,
    customer_birthday: payload.customer_birthday
  };

  // 1. Save to LocalStorage immediately
  try {
    const localOrders = getLocalOrders();
    const updated = [newOrder, ...localOrders.filter(o => o.id !== sequentialId)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SEQUENCE_KEY, String(nextNum));

    // Also push to bot logs
    const existingLogs = JSON.parse(localStorage.getItem('wed_bot_dispatch_logs') || '[]');
    localStorage.setItem('wed_bot_dispatch_logs', JSON.stringify([{
      id: `NOTIF-${Date.now()}`,
      orderId: sequentialId,
      customerName: payload.customer_name,
      customerPhone: payload.phone,
      total: payload.total,
      itemsCount: payload.items.length,
      status: 'sent',
      timestamp: new Date().toISOString()
    }, ...existingLogs.slice(0, 49)]));
  } catch (e) {
    console.error('LocalStorage order save error:', e);
  }

  // 2. Forward to Make Webhook via Server-side Endpoint (/api/orders/webhook)
  try {
    let intlPhone = payload.phone.replace(/\D/g, '');
    if (intlPhone.startsWith('967')) {
      intlPhone = `+${intlPhone}`;
    } else if (intlPhone.startsWith('7') && intlPhone.length === 9) {
      intlPhone = `+967${intlPhone}`;
    } else if (intlPhone.length > 0) {
      intlPhone = `+${intlPhone}`;
    }

    const webhookPayload = {
      event: 'order.created',
      order: {
        order_id: sequentialId,
        order_number: sequentialId,
        status: 'new',
        created_at: newOrder.created_at
      },
      customer: {
        name: payload.customer_name,
        phone: intlPhone,
        city: payload.city || 'صنعاء',
        address: payload.address
      },
      items: payload.items.map(item => ({
        product_id: item.id || '',
        product_name: item.name || '',
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        subtotal: (item.price || 0) * (item.quantity || 1)
      })),
      totals: {
        subtotal: payload.subtotal || 0,
        shipping: payload.delivery_fee || 0,
        total: payload.total || 0
      },
      notes: payload.notes || '',
      idempotency_key: sequentialId
    };

    fetch('/api/orders/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    }).catch(err => {
      console.warn('Webhook trigger notice (offline/queued):', err);
    });
  } catch (webhookErr) {
    console.warn('Webhook initiation notice:', webhookErr);
  }

  // 3. Save to Supabase (Customers and Orders)
  try {
    // 3.1 Save or update Customer
    let customerId = null;
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert({
        phone: payload.phone, // unique constraint
        name: payload.customer_name,
        city: payload.city || 'صنعاء',
        address: payload.address,
        notes: payload.notes || ''
      }, { onConflict: 'phone' })
      .select('id')
      .single();

    if (!customerError && customerData) {
      customerId = customerData.id;
    }

    // 3.2 Save Order
    await supabase.from('orders').insert({
      id: sequentialId,
      order_number: sequentialId,
      customer_id: customerId,
      status: 'pending',
      items: payload.items,
      subtotal: payload.subtotal || 0,
      shipping: payload.delivery_fee || 0,
      total: payload.total,
      notes: payload.notes || ''
    });
  } catch (err) {
    console.warn('Supabase order insert notice (local persistence active):', err);
  }

  // 4. Dispatch events to notify Admin Dashboard & Navbar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('order_created', { detail: newOrder }));
    window.dispatchEvent(new Event('order_updated'));
    window.dispatchEvent(new Event('storage'));
  }

  return newOrder;
}

/**
 * Fetches all orders combining Supabase and LocalStorage
 */
export async function fetchAllOrders(): Promise<StoreOrder[]> {
  const local = getLocalOrders();
  let remote: StoreOrder[] = [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(name, phone, city, address)')
      .order('created_at', { ascending: false });

    if (data && !error && data.length > 0) {
      remote = data.map((d: any) => ({
        id: d.id,
        order_id: d.id,
        customer_name: d.customers?.name || d.customer_name || 'عميلة وِد',
        phone: d.customers?.phone || d.phone || '',
        address: d.customers?.address || d.address || 'صنعاء',
        city: d.customers?.city || d.city || 'صنعاء',
        notes: d.notes || '',
        delivery_slot: d.delivery_slot || '',
        shipping_method: d.shipping_method || '',
        total: Number(d.total) || 0,
        status: d.status || 'pending',
        created_at: d.created_at || new Date().toISOString(),
        items: Array.isArray(d.items) ? d.items : []
      }));
    }
  } catch (e) {
    // fallback
  }

  // Merge remote and local (local orders take precedence if updated recently, but all orders are preserved)
  const orderMap = new Map<string, StoreOrder>();
  
  // Add remote first
  remote.forEach(o => orderMap.set(o.id, o));

  // Add/override with local
  local.forEach(o => orderMap.set(o.id, o));

  const allOrders = Array.from(orderMap.values());

  // Sort by date newest first
  allOrders.sort((a, b) => {
    const tA = new Date(a.created_at || a.createdAt || 0).getTime();
    const tB = new Date(b.created_at || b.createdAt || 0).getTime();
    return tB - tA;
  });

  return allOrders;
}

/**
 * Updates status of an order
 */
export async function updateOrderStatusInStore(orderId: string, newStatus: string): Promise<void> {
  // 1. Update localStorage
  try {
    const local = getLocalOrders();
    const updated = local.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  // 2. Update Supabase
  try {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  } catch (e) {
    // ignore
  }

  // 3. Dispatch events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('order_updated'));
    window.dispatchEvent(new Event('storage'));
  }
}
