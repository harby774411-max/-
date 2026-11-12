import { createClient } from '@supabase/supabase-js';

const MAKE_WEBHOOK_FALLBACK = 'https://hook.eu1.make.com/hft85bliffldixrlakorrne1pq3b8j6f';

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

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendEmergencyEmail(input: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  products: string;
  total: number;
  failure: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.EMERGENCY_ALERT_EMAIL || 'harby774411@gmail.com';
  const from = process.env.RESEND_FROM_EMAIL || 'Wad Store Alerts <onboarding@resend.dev>';
  if (!apiKey) {
    console.error('[Wad emergency email] RESEND_API_KEY is not configured; Telegram failure alert was not emailed.', { orderId: input.orderId, failure: input.failure });
    return { status: 'not_configured' } as const;
  }
  const subject = `🚨 تنبيه طارئ: تعطل إشعار تليجرام - طلب جديد رقم ${input.orderId}`;
  const text = [
    'تعذر إرسال إشعار الطلب إلى Telegram.',
    `سبب الفشل: ${input.failure}`,
    '',
    `رقم الطلب: ${input.orderId}`,
    `اسم العميل: ${input.customerName}`,
    `رقم الهاتف: ${input.customerPhone}`,
    `المدينة: ${input.city}`,
    `العنوان: ${input.address}`,
    `المنتجات: ${input.products}`,
    `الإجمالي: ${input.total.toLocaleString()} ر.ي`,
    '',
    'الطلب محفوظ في Supabase، لكن Telegram لم يستقبل الإشعار.'
  ].join('\n');
  try {
    const response = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text })
    }, 2000);
    const responseText = await response.text();
    console.log('[Wad emergency email] response:', { status: response.status, ok: response.ok, orderId: input.orderId });
    if (!response.ok) console.error('[Wad emergency email] provider error:', responseText.slice(0, 500));
    return { status: response.ok ? 'sent' : `http_${response.status}` } as const;
  } catch (error: any) {
    console.error('[Wad emergency email] failed:', { orderId: input.orderId, error: error?.message || error });
    return { status: 'failed' } as const;
  }
}

async function sendWhatsAppOrderNotification(input: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  products: string;
  total: number;
}) {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const recipientPhone = normalizePhone(process.env.WAD_ORDER_ALERT_PHONE);
  const templateName = String(process.env.WAD_ORDER_ALERT_TEMPLATE || '').trim();
  const languageCode = String(process.env.WAD_ORDER_ALERT_LANGUAGE || 'ar').trim();
  if (!accessToken || !phoneNumberId || !recipientPhone || !templateName) {
    return { status: 'not_configured' } as const;
  }
  const graphVersion = process.env.META_GRAPH_API_VERSION || 'v26.0';
  const response = await fetchWithTimeout(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: input.orderId },
            { type: 'text', text: input.customerName },
            { type: 'text', text: input.customerPhone },
            { type: 'text', text: input.products },
            { type: 'text', text: String(input.total) }
          ]
        }]
      }
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Wad WhatsApp notification]', response.status, errorText.slice(0, 500));
    return { status: `http_${response.status}` } as const;
  }
  return { status: 'sent' } as const;
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
    let saved: any = { order_id: idempotencyKey, status: 'already_processed' };
    const { data: rpcSaved, error: saveError } = await supabase.rpc('submit_wad_order', { p_payload: {
      ...payload,
      idempotency_key: idempotencyKey,
      customer: { ...customer, phone: customerPhone }
    }});
    if (saveError) {
      const duplicateOrder = /duplicate key|orders_pkey|order_number_key/i.test(String(saveError.message || saveError.details || ''));
      if (!duplicateOrder) {
        console.error('[Wad order webhook] RPC save failed; trying direct database fallback:', {
          orderId: idempotencyKey,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code
        });
        let fallbackCustomerId: string | null = null;
        const { data: fallbackCustomer, error: fallbackCustomerError } = await supabase
          .from('customers')
          .upsert({
            phone: customerPhone,
            name: String(customer.name || payload.customer_name || '').trim(),
            city: String(customer.city || payload.city || 'صنعاء'),
            address: String(customer.address || payload.address || ''),
            notes: String(payload.notes || '')
          }, { onConflict: 'phone' })
          .select('id')
          .single();
        if (!fallbackCustomerError && fallbackCustomer) fallbackCustomerId = fallbackCustomer.id;
        const { error: fallbackOrderError } = await supabase.from('orders').insert({
          id: idempotencyKey,
          order_number: idempotencyKey,
          customer_id: fallbackCustomerId,
          customer_name: String(customer.name || payload.customer_name || '').trim(),
          customer_phone: customerPhone,
          city: String(customer.city || payload.city || 'صنعاء'),
          address: String(customer.address || payload.address || ''),
          status: 'pending',
          items: payload.items,
          subtotal: Number(payload.totals?.subtotal ?? payload.subtotal ?? 0),
          discount: Number(payload.discount ?? payload.discount_amount ?? payload.totals?.discount ?? 0),
          coupon_code: String(payload.coupon_code || '').trim() || null,
          shipping: Number(payload.totals?.shipping ?? payload.shipping ?? payload.delivery_fee ?? 0),
          total: Number(payload.totals?.total ?? payload.total ?? 0),
          notes: String(payload.notes || '')
        });
        if (fallbackOrderError && !/duplicate key|orders_pkey|order_number_key/i.test(String(fallbackOrderError.message || ''))) {
          throw fallbackOrderError;
        }
        saved = { order_id: idempotencyKey, status: fallbackOrderError ? 'already_processed' : 'saved_with_fallback' };
      } else {
        console.warn('[Wad order webhook] order already saved; continuing notification delivery:', { orderId: idempotencyKey });
      }
    } else if (rpcSaved) {
      saved = rpcSaved;
    }

    let makeStatus = 'not_configured';
    let whatsappStatus = 'not_configured';
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL || MAKE_WEBHOOK_FALLBACK;
    console.log('[Wad Telegram webhook] using Make endpoint:', process.env.MAKE_WEBHOOK_URL ? 'environment variable' : 'verified fallback for scenario 7237136');
    // The order may already exist because the client performs a best-effort save.
    // Notification delivery must still run; Supabase idempotency and Make's order key handle duplicates.
    if (makeWebhookUrl) {
      const makeItems = Array.isArray(payload.items)
        ? payload.items.map((item: any) => `${item.product_name || item.name || item.product_id || 'منتج'} × ${item.quantity || 1}`).join('، ')
        : String(payload.products || '');
      const notificationProducts = Array.isArray(payload.items)
        ? payload.items.map((item: any) => `${item.product_name || item.name || item.product_id || 'منتج'} × ${item.quantity || 1} — ${Number(item.unit_price || item.price || 0).toLocaleString()} ر.ي`).join('، ')
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
        products_text: notificationProducts,
        coupon_code: String(payload.coupon_code || '').trim(),
        discount: Number(payload.discount ?? payload.discount_amount ?? payload.totals?.discount ?? 0),
        discount_amount: Number(payload.discount ?? payload.discount_amount ?? payload.totals?.discount ?? 0),
        shipping: Number(payload.delivery_fee ?? payload.shipping ?? payload.totals?.shipping ?? 0),
        total: Number(payload.totals?.total ?? payload.total ?? 0),
        payment_method: String(payload.payment_method || ''),
        customer_message: String(payload.customer_message || ''),
        notes: String(payload.notes || ''),
        customer: { ...customer, phone: customerPhone },
        order: { ...order, order_id: saved?.order_id || idempotencyKey }
      };
      const couponCode = String(makePayload.coupon_code || '').trim();
      const discountAmount = Number(makePayload.discount_amount || 0);
      const shippingAmount = Number(makePayload.shipping || 0);
      const subtotalAmount = Number(payload.totals?.subtotal ?? payload.subtotal ?? 0);
      makePayload.telegram_message = [
        'طلب جديد من متجر وِد',
        `رقم الطلب: ${idempotencyKey}`,
        `اسم العميل: ${makePayload.customer_name}`,
        `رقم الهاتف: ${customerPhone}`,
        `المدينة: ${makePayload.city}`,
        `العنوان: ${makePayload.customer_address}`,
        'المنتجات:', notificationProducts,
        `المبلغ الأساسي: ${subtotalAmount.toLocaleString()} ر.ي`,
        `كود الخصم: ${couponCode || 'لا يوجد'}`,
        `قيمة الخصم: ${discountAmount.toLocaleString()} ر.ي`,
        `الشحن: ${shippingAmount > 0 ? `${shippingAmount.toLocaleString()} ر.ي` : 'مجاني'}`,
        `الإجمالي النهائي: ${makePayload.total.toLocaleString()} ر.ي`
      ].join('\n');
      console.log('[Wad Telegram webhook] outgoing payload:', JSON.stringify(makePayload));
      const emergencyInput = { orderId: idempotencyKey, customerName: String(customer.name || payload.customer_name || '').trim(), customerPhone, city: String(customer.city || payload.city || 'صنعاء'), address: String(customer.address || payload.customer_address || '').trim(), products: notificationProducts, total: Number(payload.totals?.total ?? payload.total ?? 0) };
      try {
        const makeResponse = await fetchWithTimeout(makeWebhookUrl, {
          method: 'POST',
          // HTTP header values must be ASCII. Keep the original Arabic order number in the JSON payload.
          headers: { 'Content-Type': 'application/json', 'X-Order-Event': 'order.created', 'X-Idempotency-Key': encodeURIComponent(idempotencyKey).slice(0, 200) },
          body: JSON.stringify(makePayload)
        });
        makeStatus = makeResponse.ok ? 'forwarded_to_make' : `make_http_${makeResponse.status}`;
        console.log('[Wad Telegram webhook] response:', { status: makeResponse.status, ok: makeResponse.ok, orderId: idempotencyKey });
        if (!makeResponse.ok) await sendEmergencyEmail({ ...emergencyInput, failure: `Make HTTP ${makeResponse.status}` });
      } catch (makeError: any) {
        makeStatus = 'make_timeout_or_network_error';
        console.error('[Wad Telegram webhook] request failed:', { orderId: idempotencyKey, error: makeError?.message || makeError });
        await sendEmergencyEmail({ ...emergencyInput, failure: makeError?.name === 'AbortError' ? 'Make timeout after 2 seconds' : (makeError?.message || 'Make network error') });
      }
    }

    if (saved?.status !== 'already_processed') {
      const notificationItems = Array.isArray(payload.items)
        ? payload.items.map((item: any) => `${item.product_name || item.name || item.product_id || 'منتج'} × ${item.quantity || 1}`).join('، ')
        : String(payload.products || '');
      const whatsappResult = await sendWhatsAppOrderNotification({
        orderId: String(saved?.order_id || idempotencyKey),
        customerName: String(customer.name || payload.customer_name || '').trim(),
        customerPhone,
        products: notificationItems,
        total: Number(payload.totals?.total ?? payload.total ?? 0)
      });
      whatsappStatus = whatsappResult.status;
    }

    return json(res, 200, {
      success: true,
      status: saved?.status === 'already_processed' ? 'already_processed' : (makeStatus === 'forwarded_to_make' ? makeStatus : 'stored_pending_automation'),
      order_id: saved?.order_id || idempotencyKey,
      make_status: makeStatus,
      whatsapp_status: whatsappStatus
    });
  } catch (error: any) {
    console.error('[Wad order webhook] failed:', { error: error?.message || error, stack: error?.stack, orderId: idempotencyKey });
    return json(res, 500, { success: false, error: 'Could not process order safely.' });
  }
}
