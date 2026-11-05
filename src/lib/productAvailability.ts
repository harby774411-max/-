import { supabase } from './supabase';

export type AvailabilityMap = Record<string, boolean>;

export async function fetchProductAvailability(productIds: string[]): Promise<AvailabilityMap> {
  if (!productIds.length) return {};
  const { data, error } = await supabase.from('product_availability').select('product_id,is_available').in('product_id', productIds);
  if (error || !data) return {};
  return Object.fromEntries(data.map(row => [row.product_id, row.is_available !== false]));
}

export async function setProductAvailability(productId: string, isAvailable: boolean) {
  return supabase.from('product_availability').upsert({ product_id: productId, is_available: isAvailable, updated_at: new Date().toISOString() });
}
