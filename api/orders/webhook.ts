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

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const query = req.query || {};
    const mode = String(query['hub.mode'] || query.mode || '');
    const verifyToken = String(query['hub.verify_token'] || query.verify_token || '');
    const challenge = String(query['hub.challenge'] || query.challenge || '');
    const configuredToken = String(process.env.META_WEBHOOK_VERIFY_TOKEN || '');
    if (mode === 'subscribe' && configuredToken && verifyToken === configuredToken && challenge) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end(challenge);
    }
    return json(res, 200, { ok: true, service: 'wad-orders-webhook' });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { success: false, error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 500, { success: false, error: 'Server configuration is incomplete.' });
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const order = payload.order || {};
  const customer = payload.customer || {};
  const idempotencyKey = String(payload.idempotency_key || order.order_id || order.order_number || '').trim();
  const customerPhone = normalizePhone(customer.phone || payload.customer_phone || payload.phone);

  if (!idempotencyKey || !String(customer.name || payload.customer_name || '').trim() || !customerPhone || !Array.isArray(payload.items) || payload.items.length === 0) {
    return json(res, 400, { success: false, error: 'Required fields: order id, customer name, customer phone, and at least one item.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: saved, error: saveError } = await supabase.rpc('submit_wad_order', { p_payload: {
      ...payload,
      idempotency_key: idempotencyKey,
      customer: { ...customer, phone: customerPhone }
    }});
    if (saveError) throw saveError;

    let makeStatus = 'not_configured';
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl && saved?.status !== 'already_processed') {
      const makeItems = Array.isArray(payload.items)
        ? payload.items.map((item: any) => `${item.product_name || item.name || item.product_id || 'منتج'} × ${item.quantity || 1}`).join('، ')
        : String(payload.products || '');
      const makePayload = {
        ...payload,
        idempotency_key: idempotencyKey,
        order_id: saved?.order_id || idempotencyKey,
        order_date: order.order_date || new Date().toISOString(),
        customer_name: String(customer.name || payload.customer_name || '').trim(),
        customer_phone: customerPhone,
        customer_email: String(customer.email || payload.customer_email || '').trim(),
        customer_address: String(customer.address || payload.customer_address || '').trim(),
        products: makeItems,
        total: Number(payload.totals?.total ?? payload.total ?? 0),
        payment_method: String(payload.payment_method || ''),
        customer_message: String(payload.customer_message || ''),
        notes: String(payload.notes || ''),
        customer: { ...customer, phone: customerPhone },
        order: { ...order, order_id: saved?.order_id || idempotencyKey }
      };
      const makeResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Order-Event': 'order.created', 'X-Idempotency-Key': idempotencyKey },
        body: JSON.stringify(makePayload)
      });
      makeStatus = makeResponse.ok ? 'forwarded_to_make' : `make_http_${makeResponse.status}`;
    }

    return json(res, 200, {
      success: true,
      status: saved?.status === 'already_processed' ? 'already_processed' : (makeStatus === 'forwarded_to_make' ? makeStatus : 'stored_pending_automation'),
      order_id: saved?.order_id || idempotencyKey,
      make_status: makeStatus
    });
  } catch (error: any) {
    console.error('[Wad order webhook]', error?.message || error);
    return json(res, 500, { success: false, error: 'Could not process order safely.' });
  }
}
