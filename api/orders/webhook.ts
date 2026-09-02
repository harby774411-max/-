import { createClient } from '@supabase/supabase-js';

function json(res: any, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function normalizePhone(value: unknown): string {
  const raw = String(value ?? '').replace(/\D/g, '');
  if (raw.startsWith('967')) return `+${raw}`;
  if (raw.startsWith('7') && raw.length === 9) return `+967${raw}`;
  return raw ? `+${raw}` : '';
}

function asItems(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return json(res, 200, { ok: true, service: 'wad-orders-webhook' });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { success: false, error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, {
      success: false,
      error: 'Server configuration is incomplete: Supabase server credentials are missing.'
    });
  }

  const payload = req.body || {};
  const order = payload.order || {};
  const customer = payload.customer || {};
  const totals = payload.totals || {};
  const items = asItems(payload.items);
  const orderId = String(order.order_id || order.order_number || '').trim();
  const customerName = String(customer.name || payload.customer_name || '').trim();
  const customerPhone = normalizePhone(customer.phone || payload.customer_phone || payload.phone);
  const idempotencyKey = String(payload.idempotency_key || orderId).trim();

  if (!orderId || !customerName || !customerPhone || items.length === 0) {
    return json(res, 400, {
      success: false,
      error: 'Required fields: order_id, customer name, customer phone, and at least one item.'
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { data: existing, error: existingError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('idempotency_key', idempotencyKey)
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return json(res, 200, {
        success: true,
        status: 'already_processed',
        order_id: existing.order_number || existing.id
      });
    }

    const { data: savedCustomer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        phone: customerPhone,
        phone_number: customerPhone,
        name: customerName,
        city: customer.city || 'صنعاء',
        governorate: customer.governorate || customer.city || 'صنعاء',
        address: customer.address || '',
        notes: payload.notes || ''
      }, { onConflict: 'phone' })
      .select('id')
      .single();

    if (customerError) throw customerError;

    const normalizedItems = items.map((item: any) => ({
      product_id: String(item.product_id || item.id || ''),
      product_name: String(item.product_name || item.name || ''),
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price ?? item.price ?? 0),
      subtotal: Number(item.subtotal ?? ((item.unit_price ?? item.price ?? 0) * (item.quantity || 1)))
    }));

    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: String(order.order_number || orderId),
        customer_id: savedCustomer?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        city: customer.city || 'صنعاء',
        address: customer.address || '',
        address_details: customer.address || '',
        status: 'new',
        items: normalizedItems,
        subtotal: Number(totals.subtotal || 0),
        shipping: Number(totals.shipping || 0),
        delivery_fee: Number(totals.shipping || 0),
        total: Number(totals.total || 0),
        notes: String(payload.notes || ''),
        idempotency_key: idempotencyKey
      })
      .select('id, order_number')
      .single();

    if (orderError) throw orderError;

    await supabase.from('order_items').insert(
      normalizedItems.map((item: any) => ({ ...item, order_id: savedOrder?.id || orderId }))
    );

    await supabase.from('order_status_history').insert({
      order_id: savedOrder?.id || orderId,
      status: 'new',
      created_by: 'wad-order-webhook'
    });

    await supabase.from('webhook_events').insert({
      provider: 'wad-store',
      event_type: 'order.created',
      idempotency_key: idempotencyKey,
      payload,
      status: 'processed',
      processed_at: new Date().toISOString()
    });

    let makeStatus = 'not_configured';
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      const makeResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Order-Event': 'order.created',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          ...payload,
          order: { ...order, order_id: savedOrder?.order_number || orderId },
          customer: { ...customer, name: customerName, phone: customerPhone },
          items: normalizedItems,
          idempotency_key: idempotencyKey
        })
      });
      makeStatus = makeResponse.ok ? 'forwarded_to_make' : `make_http_${makeResponse.status}`;
    }

    return json(res, 200, {
      success: true,
      status: makeStatus === 'forwarded_to_make' ? makeStatus : 'stored_pending_automation',
      order_id: savedOrder?.order_number || orderId,
      make_status: makeStatus
    });
  } catch (error: any) {
    console.error('[Wad order webhook]', error?.message || error);
    return json(res, 500, {
      success: false,
      error: 'Could not process order safely.'
    });
  }
}
