import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Safe derivation of __filename and __dirname for both ESM and bundled CJS environments
let currentFilename = '';
let currentDirname = '';

try {
  currentFilename = fileURLToPath(import.meta.url);
  currentDirname = path.dirname(currentFilename);
} catch (e) {
  currentFilename = __filename;
  currentDirname = __dirname;
}

// In-memory idempotency cache to prevent duplicate webhook delivery
const processedOrders = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API: Forward Order to Make Webhook (Server-Side Only)
  app.post('/api/orders/webhook', async (req, res) => {
    try {
      const orderData = req.body;

      if (!orderData || !orderData.order || !orderData.order.order_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing order_id or order payload' 
        });
      }

      const idempotencyKey = orderData.idempotency_key || orderData.order.order_id;

      // Idempotency protection: Prevent duplicate webhooks for the exact same order
      if (processedOrders.has(idempotencyKey)) {
        return res.json({ 
          success: true, 
          status: 'already_processed', 
          message: 'Order webhook already processed previously',
          order_id: orderData.order.order_id 
        });
      }

      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
      
      if (!makeWebhookUrl) {
        console.error('[Server Error]: MAKE_WEBHOOK_URL is missing in environment variables.');
        return res.status(500).json({
          success: false,
          error: 'Webhook configuration error on server'
        });
      }

      // Send to Make with retry mechanism (up to 2 retries on network/5xx error)
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;
      let webhookSuccess = false;
      let webhookStatus = 200;

      while (attempts < maxAttempts && !webhookSuccess) {
        attempts++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

          const response = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Order-Event': 'order.created',
              'X-Idempotency-Key': String(idempotencyKey)
            },
            body: JSON.stringify(orderData), // Forward the strictly structured JSON
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok || response.status === 200 || response.status === 201 || response.status === 204) {
            webhookSuccess = true;
            webhookStatus = response.status;
            processedOrders.add(idempotencyKey);
            break;
          } else {
            webhookStatus = response.status;
            lastError = new Error(`Make Webhook returned HTTP status ${response.status}`);
            // Wait briefly before retry if not last attempt
            if (attempts < maxAttempts) {
              await new Promise((r) => setTimeout(r, 600 * attempts));
            }
          }
        } catch (fetchErr: any) {
          lastError = fetchErr;
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 600 * attempts));
          }
        }
      }

      if (webhookSuccess) {
        return res.json({
          success: true,
          status: 'forwarded_to_make',
          order_id: orderData.order.order_id,
          message: 'تم إرسال بيانات الطلب إلى Make بنجاح'
        });
      } else {
        // Fallback: If Make is temporarily unreachable, do not fail the purchase.
        // Return pending_automation status so client stores it locally.
        console.warn(`[Make Webhook] Could not reach Make after ${attempts} attempts:`, lastError?.message);
        return res.json({
          success: true,
          status: 'pending_automation',
          order_id: orderData.order.order_id,
          warning: 'Order created but Make automation queued for retry'
        });
      }

    } catch (err: any) {
      console.error('[Server Error in /api/orders/webhook]:', err);
      // Return success with pending_automation to prevent disrupting user experience
      return res.status(200).json({
        success: true,
        status: 'pending_automation',
        error: err?.message || 'Server automation error'
      });
    }
  });

  // API: Server-side Gemini AI Skincare Consultant
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, chatHistory, customInstructions, trainingRules, productsList } = req.body;

      // Extract active training rules knowledge base
      let trainingKnowledgeText = '';
      if (Array.isArray(trainingRules) && trainingRules.length > 0) {
        trainingKnowledgeText = '\n\n【قواعد وسيناريوهات التدريب المعتمدة من إدارة متجر وِد】:\n' + 
          trainingRules
            .filter((r: any) => r.isActive !== false)
            .map((r: any, idx: number) => 
              `${idx + 1}. السؤال/الاستفسار: "${r.title || r.questionExample || ''}" (الكلمات الدالة: ${r.keywords || ''})\n   الإجابة المعتمدة: ${r.response}`
            ).join('\n\n');
      }

      // Extract current products summary
      let productsSummaryText = '';
      if (Array.isArray(productsList) && productsList.length > 0) {
        productsSummaryText = '\n\n【كتالوج المنتجات المتوفرة حالياً في المتجر مع الأسعار】:\n' +
          productsList.slice(0, 15).map((p: any) => 
            `- ${p.nameAr || p.name_ar || p.nameEn}: السعر ${p.price || p.price_after || ''} ر.ي (الفئة: ${p.category || 'عناية'}). الوصف: ${p.descriptionAr || p.description_ar || ''}`
          ).join('\n');
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
          
          const systemInstruction = (customInstructions || 
            `أنتِ المستشارة الذكية والمتخصصة لمتجر «وِد» (WED) الفاخر للعناية بالبشرة في اليمن (صنعاء وجميع المحافظات).
قدمي نصائح صيدلانية وجمالية راقية وموجزة ومباشرة باللغة العربية الفصحى الدافئة.
اقترحي روتينات العناية والمنتجات المناسبة تماماً لنوع بشرة العميل وتفضيلاته.
أكدي أن التوصيل مجاني وسريع داخل صنعاء مع الشحن لكافة المحافظات اليمنية، والدفع عند الاستلام متاح.`) + 
            trainingKnowledgeText + 
            productsSummaryText;

          const contents = Array.isArray(chatHistory) 
            ? chatHistory.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text || '' }]
              }))
            : [];

          if (message && message.trim()) {
            contents.push({
              role: 'user',
              parts: [{ text: message }]
            });
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents,
            config: {
              systemInstruction,
            }
          });

          if (response && response.text) {
            return res.json({ success: true, text: response.text });
          }
        } catch (aiErr: any) {
          console.warn('[Gemini API notice]:', aiErr?.message);
        }
      }

      // Dynamic rule-based expert fallback for skincare queries when API key is pending
      const lower = (message || '').toLowerCase();

      // Check custom training rules first
      if (Array.isArray(trainingRules)) {
        for (const rule of trainingRules) {
          if (rule.isActive === false) continue;
          const kws = (rule.keywords || '').split(/[,،\n]+/).map((k: string) => k.trim().toLowerCase()).filter(Boolean);
          const hasMatch = kws.some((kw: string) => lower.includes(kw));
          if (hasMatch) {
            return res.json({ 
              success: true, 
              text: rule.response,
              matchedRuleId: rule.id,
              recommendedProductIds: rule.recommendedProductIds || []
            });
          }
        }
      }

      let reply = 'أهلاً بكِ في متجر «وِد» 🌸 ';

      if (lower.includes('حبوب') || lower.includes('مسام') || lower.includes('دهن') || lower.includes('زيوان')) {
        reply += 'للبشرة الدهنية والمعرضة للمسامات والحبوب، ننصحكِ بروتين وِد: البدء بغسول التوازن اللطيف مرتين يومياً، يليه سيروم النياسيناميد والزنك لتنظيم الإفرازات وتهدئة البشرة، مع واقي الشمس النهاري الشفاف SPF 50+.';
      } else if (lower.includes('جاف') || lower.includes('ترطيب') || lower.includes('قشور') || lower.includes('حاجز')) {
        reply += 'للبشرة الجافة وترميم حاجز البشرة، نوصي بكريم الترطيب المخملي الغني بالسيراميد متبوعاً بسيروم الهيالورونيك على بشرة ندية لحبس الرطوبة والتخلص الفوري من القشور.';
      } else if (lower.includes('نضار') || lower.includes('تفتيح') || lower.includes('بقع') || lower.includes('كلف') || lower.includes('هالات')) {
        reply += 'للحصول على توهج وإشراقة ونضارة فورية وتوحيد اللون، باقة النضارة الفاخرة وسيروم فيتامين C المطور هما الخيار المثالي لحماية الخلايا وتفتيح التصبغات.';
      } else if (lower.includes('حساس') || lower.includes('احمرار') || lower.includes('وخز') || lower.includes('تهيج')) {
        reply += 'للبشرة الحساسة، مستحضرات وِد نقية وخالية تماماً من العطور القاسية والكحول، ومركب السنتيلا والبانثينول يهدئ أي احمرار فوراً.';
      } else if (lower.includes('شمس') || lower.includes('واقي') || lower.includes('spf')) {
        reply += 'واقي شمس وِد SPF 50+ شفاف تماماً ولا يترك أي أثر أبيض ومناسب لطقس اليمن الحار، يُوضع قبل الخروج بربع ساعة ويُجدد بانتظام.';
      } else if (lower.includes('حامل') || lower.includes('رضاع')) {
        reply += 'أثناء فترة الحمل والرضاعة، ننصح بسيروم فيتامين C، سيروم الهيالورونيك، كريم السيراميد، وغسول التوازن اللطيف، مع تجنب مشتقات الريتينول المركزة.';
      } else if (lower.includes('توصيل') || lower.includes('شحن') || lower.includes('سعر') || lower.includes('دفع') || lower.includes('كريمي') || lower.includes('جيب')) {
        reply += 'التوصيل مجاني وسريع داخل صنعاء، ونوفر الشحن الموثوق لكافة المحافظات اليمنية مع خيارات الدفع نقداً عند الاستلام، محفظة جيب (Jeeb)، تحويل الكريمي، أو ون كاش.';
      } else {
        reply += 'مستشارة وِد للعناية بالبشرة جاهزة لمساعدتكِ في تحديد الروتين الأنسب لبشرتكِ. يمكنكِ تصفح باقات وِد أو مراسلتنا مباشرة عبر واتساب المتجر 🌸';
      }

      return res.json({ success: true, text: reply });
    } catch (e: any) {
      return res.json({
        success: true,
        text: 'يسعدنا مساعدتكِ دائماً في متجر «وِد» 🌸 يمكنكِ تصفح منتجاتنا المتخصصة أو مراسلتنا فوراً عبر واتساب للمشورة المباشرة.'
      });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wed Luxury Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
