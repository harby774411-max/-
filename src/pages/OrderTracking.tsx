import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, Phone, Sparkles, MapPin, Truck, PackageCheck, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/useSettings';
import { getLocalOrders } from '../lib/orderStorage';
import { WhatsAppIcon } from '../components/SocialIcons';

export const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('order') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { settings } = useSettings();

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setSearchQuery(orderParam);
      trackOrder(orderParam);
    }
  }, [searchParams]);

  const trackOrder = async (queryStr: string) => {
    const query = queryStr.trim();
    if (!query) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      const cleanPhone = query.replace(/\D/g, '');
      const localOrders = getLocalOrders();
      
      // 1. First check local orders
      const matchedLocal = localOrders.find(o => {
        const oNum = (o.orderNumber || o.order_id || o.id || '').toLowerCase();
        const qLower = query.toLowerCase();
        if (oNum === qLower || oNum.includes(qLower) || qLower.includes(oNum)) return true;
        if (cleanPhone.length >= 7 && o.phone && o.phone.replace(/\D/g, '').includes(cleanPhone)) return true;
        return false;
      });

      if (matchedLocal) {
        setOrder(matchedLocal);
        setLoading(false);
        return;
      }
      
      // 2. Try by order number or id from Supabase
      let { data } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if ((!data || data.length === 0) && cleanPhone.length >= 7) {
        const { data: phoneData } = await supabase
          .from('orders')
          .select('*')
          .ilike('phone', `%${cleanPhone}%`)
          .order('created_at', { ascending: false })
          .limit(1);
        data = phoneData;
      }

      if (data && data.length > 0) {
        setOrder(data[0]);
      } else {
        setErrorMsg('لم نتمكن من العثور على طلب بهذا الرقم. يرجى التأكد من رقم الطلب (مثال: WED-2026-1042 أو وِد-001) أو رقم الهاتف المسجل.');
      }
    } catch (err) {
      console.error("Track error:", err);
      setErrorMsg('تعذر جلب تفاصيل الطلب حالياً. يرجى التواصل معنا عبر واتساب للمساعدة.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(searchQuery);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'new': case 'review': case 'pending': return 1;
      case 'confirmed': return 2;
      case 'preparing': case 'in-preparation': return 3;
      case 'shipping': case 'delivering': case 'shipped': return 4;
      case 'delivered': case 'completed': return 5;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status || 'review') : 1;

  const steps = [
    { num: 1, label: 'قيد المراجعة', desc: 'تم استلام وتوثيق طلبكِ' },
    { num: 2, label: 'تم التأكيد', desc: 'تم تأكيد حجز المنتجات' },
    { num: 3, label: 'قيد التجهيز', desc: 'تغليف الشحنة بعناية مخملية' },
    { num: 4, label: 'خرج للتوصيل', desc: 'الشحنة مع مندوب التوصيل' },
    { num: 5, label: 'تم التسليم', desc: 'وصلت شحنتكِ بنجاح' },
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-cream min-h-screen text-brand-text">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="arabic-text text-2xl sm:text-3xl font-black text-brand-text">
            تتبعي حالة طلبكِ
          </h1>
          <p className="arabic-text text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
            أدخلي رقم الطلب أو رقم الهاتف المسجل لمعرفة المرحلة الحالية للتجهيز والتوصيل
          </p>
        </div>

        {/* Search Input Form */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-brand-border shadow-xs">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
              <input
                type="text"
                required
                placeholder="أدخلي رقم الطلب (مثال: WED-2026-1042 أو وِد-001)..."
                className="w-full pr-10 pl-4 py-3 bg-brand-cream/40 border border-brand-border rounded-2xl arabic-text text-xs outline-none focus:border-brand-blue text-brand-text placeholder-brand-muted/70 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-bold arabic-text text-xs hover:bg-brand-blue/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? 'جاري البحث...' : 'تتبع الطلب'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-3.5 p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs arabic-text font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6 text-right"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-brand-border">
                <div className="text-right">
                  <span className="text-[11px] text-brand-muted font-bold block">رقم الطلب:</span>
                  <span className="font-mono text-base font-black text-brand-blue">
                    {order.orderNumber || order.order_id || order.id}
                  </span>
                </div>
                <div className="text-right sm:text-left">
                  <span className="text-[11px] text-brand-muted font-bold block">الاسم:</span>
                  <span className="arabic-text text-xs sm:text-sm font-bold text-brand-text">
                    {order.customerName || order.customer_name || 'عميلة وِد'}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-brand-muted font-bold block">المبلغ الإجمالي:</span>
                  <span className="font-sans text-base font-black text-brand-text">
                    {Number(order.total || 0).toLocaleString()} <small className="arabic-text text-[10px] text-brand-muted">ر.ي</small>
                  </span>
                </div>
              </div>

              {/* Products List Summary if available */}
              {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                <div className="space-y-2 bg-brand-cream/50 p-4 rounded-2xl border border-brand-border text-right">
                  <h4 className="arabic-text font-bold text-xs text-brand-text">المستحضرات المطلوبة:</h4>
                  <div className="space-y-1.5">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs arabic-text py-1 border-b border-brand-border/40 last:border-0">
                        <span className="font-medium text-brand-text">
                          {item.name || item.nameAr || 'مستحضر وِد'} <span className="text-brand-muted text-[11px]">× {item.quantity || 1}</span>
                        </span>
                        <span className="font-sans font-bold text-brand-text">
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()} ر.ي
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="space-y-3">
                <h3 className="arabic-text font-bold text-xs sm:text-sm text-brand-text text-right">
                  مراحل معالجة الشحنة:
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {steps.map((step) => {
                    const isDone = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div
                        key={step.num}
                        className={`p-3 rounded-2xl border transition-all text-center space-y-1 ${
                          isDone
                            ? 'bg-brand-blue/10 border-brand-blue text-brand-text'
                            : 'bg-brand-cream/30 border-brand-border text-brand-muted/70'
                        } ${isCurrent ? 'ring-2 ring-brand-blue shadow-xs font-bold' : ''}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold font-sans ${
                            isDone ? 'bg-brand-blue text-white' : 'bg-brand-cream text-brand-muted'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
                        </div>
                        <h4 className="arabic-text text-xs font-bold">{step.label}</h4>
                        <p className="arabic-text text-[10px] leading-tight opacity-75">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address */}
              {(order.address || order.city) && (
                <div className="p-3.5 bg-brand-cream/50 rounded-2xl border border-brand-border flex items-start gap-2.5 text-right">
                  <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h5 className="arabic-text font-bold text-xs text-brand-text">عنوان التسليم:</h5>
                    <p className="arabic-text text-xs text-brand-muted mt-0.5">
                      {order.city ? `${order.city} - ` : ''}{order.address || order.addressDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp Contact Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-brand-border">
                <div className="text-right">
                  <h4 className="arabic-text font-bold text-xs text-brand-text">هل تحتاجين لتعديل العنوان أو وقت التوصيل؟</h4>
                  <p className="arabic-text text-[11px] text-brand-muted">فريق خدمة عملاء «وِد» في خدمتكِ دائماً</p>
                </div>
                <a
                  href={`https://wa.me/${(settings?.whatsapp_orders || settings?.whatsapp || '967770000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار عن طلبي رقم #${order.orderNumber || order.order_id || order.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold arabic-text hover:bg-brand-blue/90 transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تواصل عبر واتساب</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
