import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, CheckCircle2, ShieldCheck, Truck, CreditCard, AlertCircle, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../lib/useSettings';
import { supabase } from '../lib/supabase';
import { createAndPersistOrder } from '../lib/orderStorage';
import { YEMEN_GOVERNORATES } from '../data';
import { WhatsAppIcon } from '../components/SocialIcons';
import { BirthdayInput } from '../components/BirthdayInput';
import { cn } from '../lib/utils';

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { settings } = useSettings();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'info' | 'success'>('info');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  // Governorate and shipping selection
  const [selectedGov, setSelectedGov] = useState<string>('sanaa');
  const [customGovName, setCustomGovName] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer_kuraimi' | 'transfer_jeeb' | 'transfer_floosak' | 'transfer_onecash' | 'transfer_bank'>('cash');
  const [birthdaySkipped, setBirthdaySkipped] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
    deliverySlot: 'tomorrow',
    birthday: '',
    joinBirthdayClub: true
  });
  
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    total: number;
    phone: string;
    city: string;
    isOutsideSanaa: boolean;
  } | null>(null);

  const navigate = useNavigate();

  // Sanaa & Suburbs detection
  const isSanaaCity = selectedGov === 'sanaa';
  const isSanaaRural = selectedGov === 'sanaa_rural';
  const isSanaaArea = isSanaaCity || isSanaaRural;
  const isOutsideSanaa = !isSanaaArea;

  // Auto switch payment method if user selects outside Sanaa while cash was selected
  useEffect(() => {
    if (isOutsideSanaa && paymentMethod === 'cash') {
      setPaymentMethod('transfer_kuraimi');
    }
  }, [selectedGov, isOutsideSanaa, paymentMethod]);

  // Ensure deliveryType is reset if express is not available
  useEffect(() => {
    if (!isSanaaCity && deliveryType === 'express') {
      setDeliveryType('standard');
    }
  }, [selectedGov, isSanaaCity, deliveryType]);

  // Shipping Fee Calculation:
  // - Sanaa City standard: 0 (Free)
  // - Sanaa City express: 1500
  // - Sanaa Rural (ضواحي صنعاء): 1500
  // - Outside Sanaa: Products total only (Shipping is separate and handled directly via management contact)
  const shippingFee = isSanaaCity 
    ? (deliveryType === 'express' ? 1500 : 0)
    : (isSanaaRural ? 1500 : 0);

  const discountAmount = Math.round((totalPrice * discountPercent) / 100);
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'WED10' || code === 'WED' || code === 'WEDVIP') {
      setDiscountPercent(10);
      setCouponMsg({ text: 'تم تطبيق كود الخصم (10%) بنجاح 🌸', type: 'success' });
    } else {
      setCouponMsg({ text: 'كود الخصم غير صالح أو منتهي الصلاحية.', type: 'error' });
      setDiscountPercent(0);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhoneInput = formData.phone.replace(/\D/g, '');
    if (!cleanPhoneInput || cleanPhoneInput.length < 8) {
      alert('يرجى إدخال رقم هاتف صحيح للتواصل');
      return;
    }
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      alert('يرجى كتابة الاسم الكامل');
      return;
    }
    if (selectedGov === 'other' && !customGovName.trim()) {
      alert('يرجى كتابة اسم المحافظة أو المدينة في الحقل المخصص');
      return;
    }
    if (!formData.address.trim() || formData.address.trim().length < 3) {
      alert('يرجى إدخال العنوان بالتفصيل (الشارع / الحي)');
      return;
    }
    if (isOutsideSanaa && paymentMethod === 'cash') {
      alert('عذراً، الدفع عند الاستلام متاح فقط لطلبات صنعاء وضواحيها. يرجى اختيار إحدى وسائل التحويل المالي.');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeOrderSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const cleanPhoneInput = formData.phone.replace(/\D/g, '');
      const cleanPhone = cleanPhoneInput.startsWith('0') 
        ? '967' + cleanPhoneInput.substring(1) 
        : (cleanPhoneInput.startsWith('967') ? cleanPhoneInput : '967' + cleanPhoneInput);

      const govObj = YEMEN_GOVERNORATES.find(g => g.id === selectedGov);
      const cityName = selectedGov === 'other' 
        ? (customGovName.trim() || 'محافظة أخرى')
        : (govObj ? govObj.nameAr : selectedGov);

      // Save / Update Customer in DB if available
      try {
        await supabase.from('customers').upsert({
          phone_number: cleanPhone,
          name: formData.fullName.trim(),
          birthday: formData.birthday || null,
          city: cityName,
          is_verified: true
        }, { onConflict: 'phone_number' });
      } catch (upsertErr) {
        // Table or columns might be optional
      }

      const shippingLabel = isSanaaCity
        ? (deliveryType === 'express' ? 'توصيل مستعجل خلال 12 ساعة (صنعاء)' : 'توصيل قياسي مجاني (صنعاء)')
        : (isSanaaRural ? 'توصيل ضواحي صنعاء (24-48 ساعة)' : `شحن المحافظات (${cityName}) - تكلفة الشحن منفصلة`);

      // Create and persist order immediately
      const newOrder = await createAndPersistOrder({
        customer_name: formData.fullName.trim(),
        phone: cleanPhone,
        address: `${cityName} - ${formData.address.trim()}`,
        city: cityName,
        notes: `${formData.notes.trim()}${isOutsideSanaa ? ' [طلب من خارج صنعاء: تكلفة الشحن منفصلة تتواصل الإدارة بشأنه]' : ''}`,
        delivery_slot: formData.deliverySlot,
        shipping_method: isSanaaCity ? (deliveryType === 'express' ? 'sanaa_express' : 'sanaa_free') : (isSanaaRural ? 'sanaa_rural' : 'governorates'),
        payment_method: paymentMethod,
        total: finalTotal,
        subtotal: totalPrice,
        discount: discountAmount,
        coupon_code: discountPercent > 0 ? couponCode.trim().toUpperCase() : undefined,
        delivery_fee: shippingFee,
        items: items.map(i => ({
          id: i.id || i.productId,
          name: i.nameAr,
          quantity: i.quantity,
          price: i.price,
          image: i.imageUrl || i.images?.[0]
        })),
        customer_birthday: (!birthdaySkipped && formData.birthday) ? formData.birthday : undefined
      });

      const orderId = newOrder.orderNumber || newOrder.id;

      setCompletedOrder({
        orderId,
        total: finalTotal,
        phone: cleanPhone,
        city: cityName,
        isOutsideSanaa
      });

      setVerificationStep('success');
      clearCart();

    } catch (error) {
      console.error("Order error:", error);
      alert('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مجدداً أو التواصل عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && verificationStep !== 'success') {
    return (
      <div className="pt-36 pb-20 text-center px-4 bg-brand-cream min-h-[75vh] flex flex-col items-center justify-center text-brand-text">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-brand-border shadow-xs">
          <ShoppingBag className="w-9 h-9 text-brand-blue" />
        </div>
        <h2 className="arabic-text text-xl sm:text-2xl font-black text-brand-text mb-2">
          سلة التسوق فارغة
        </h2>
        <p className="arabic-text text-brand-muted mb-6 text-xs sm:text-sm max-w-sm">
          لم تقومي بإضافة أي مستحضرات للعناية ببشرتكِ بعد. استكشفي كتالوج مستحضرات «وِد» الآن.
        </p>
        <Link 
          to="/products" 
          className="bg-brand-blue text-white px-7 py-3.5 rounded-2xl arabic-text text-xs sm:text-sm font-bold inline-flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-xs"
        >
          <span>تصفح المنتجات</span>
          <ArrowRight className="rotate-180 w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-cream min-h-screen text-brand-text">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="arabic-text text-xl sm:text-2xl font-black text-brand-text text-right">
            سلة المشتريات وتأكيد الطلب
          </h1>
          {verificationStep !== 'success' && (
            <span className="arabic-text text-xs text-brand-text font-bold bg-white px-3.5 py-1.5 rounded-xl border border-brand-border shadow-xs">
              {totalItems} مستحضرات
            </span>
          )}
        </div>

        {verificationStep === 'success' && completedOrder ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="arabic-text text-xl sm:text-2xl font-black text-brand-text">
                تم تسجيل طلبكِ بنجاح 🌸
              </h2>
              <p className="arabic-text text-xs text-brand-muted">
                شكراً لثقتكِ بـ «وِد» للعناية بالبشرة. سيقوم فريقنا بمراجعة وتجهيز شحنتكِ فوراً.
              </p>
              <div className="pt-2">
                <span className="arabic-text text-xs sm:text-sm font-bold text-brand-blue bg-brand-cream border border-brand-border px-4 py-2 rounded-xl inline-block font-mono">
                  رقم الطلب: <strong className="font-black text-sm sm:text-base mr-1">{completedOrder.orderId}</strong>
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-brand-cream/60 rounded-2xl border border-brand-border text-right text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
                <span className="text-brand-muted">المبلغ الإجمالي للمنتجات:</span>
                <strong className="font-sans text-sm sm:text-base font-black text-brand-text">{completedOrder.total.toLocaleString()} ر.ي</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">حالة الطلب:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">قيد المراجعة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">المدينة / المحافظة:</span>
                <span className="text-brand-text font-bold">{completedOrder.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">رقم التواصل:</span>
                <span className="text-brand-text font-mono font-bold">{completedOrder.phone}</span>
              </div>

              {/* Outside Sanaa Special Notification Badge on Success */}
              {completedOrder.isOutsideSanaa && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-right space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>ملاحظة الشحن لموقعكِ ({completedOrder.city}):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    هذه التكلفة خاصة بالمنتجات فقط، وتكلفة التوصيل والشحن منفصلة حيث أن التوصيل المجاني حصري لأمانة العاصمة صنعاء. سيتم التواصل معكِ هاتفياً أو عبر الواتساب من قبل الإدارة لتنسيق تفاصيل الشحن والفرع المناسب لكِ.
                  </p>
                </div>
              )}
            </div>

            {/* Direct Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(`/track?order=${completedOrder.orderId}`)}
                className="flex-1 bg-brand-blue text-white py-3.5 rounded-2xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-blue/90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>تتبع حالة الشحنة</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-brand-cream text-brand-text border border-brand-border py-3.5 rounded-2xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-cream/80 transition-all cursor-pointer"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-3.5">
              {items.map((item) => (
                <div 
                  key={item.id || item.productId}
                  className="bg-white p-4 rounded-3xl border border-brand-border flex flex-col sm:flex-row items-center gap-4 text-right shadow-xs"
                >
                  <img 
                    src={item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'} 
                    alt={item.nameAr} 
                    className="w-20 h-20 rounded-2xl object-cover border border-brand-border shrink-0"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="arabic-text font-black text-xs sm:text-sm text-brand-text truncate">
                        {item.nameAr}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.id || item.productId)}
                        className="text-brand-muted hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="حذف من السلة"
                        aria-label="حذف المستحضر من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">
                      {item.size || '30 مل'} • {item.recommendationReason || 'تركيبة نقية ومختبرة'}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/60">
                      <div className="flex items-center gap-1.5 bg-brand-cream/60 p-1 rounded-xl border border-brand-border">
                        <button 
                          onClick={() => updateQuantity(item.id || item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-brand-text flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer shadow-xs"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-sans font-bold text-xs text-brand-text">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id || item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white text-brand-text flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer shadow-xs"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans font-black text-sm sm:text-base text-brand-text">
                        {(item.price * item.quantity).toLocaleString()} <small className="text-[11px] text-brand-muted font-bold mr-0.5">ر.ي</small>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout & Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              {showCheckout ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                    <h2 className="arabic-text text-sm sm:text-base font-black text-brand-text">
                      بيانات استلام الطلب
                    </h2>
                    <button 
                      onClick={() => setShowCheckout(false)}
                      className="text-xs text-brand-blue hover:underline cursor-pointer"
                    >
                      تعديل السلة
                    </button>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-right">
                    <div className="space-y-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">الاسم الكامل *</label>
                      <input
                        required
                        type="text"
                        placeholder="مثال: سارة محمد"
                        className="w-full px-3.5 py-2.5 bg-brand-cream/40 rounded-xl border border-brand-border focus:border-brand-blue arabic-text text-xs outline-none text-brand-text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">رقم الهاتف / الواتساب *</label>
                      <input
                        required
                        type="tel"
                        dir="ltr"
                        placeholder="770000000"
                        className="w-full px-3.5 py-2.5 bg-brand-cream/40 rounded-xl border border-brand-border focus:border-brand-blue text-xs outline-none text-brand-text text-right font-sans"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">المحافظة / المدينة *</label>
                      <select
                        value={selectedGov}
                        onChange={(e) => setSelectedGov(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-brand-cream/40 rounded-xl border border-brand-border focus:border-brand-blue text-xs outline-none text-brand-text cursor-pointer font-sans"
                      >
                        {YEMEN_GOVERNORATES.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Manual City / Area Input when 'other' is selected */}
                    {selectedGov === 'other' && (
                      <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5 animate-fadeIn">
                        <label className="arabic-text text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span>📍 كتابة موقعكِ أو محافظتكِ يدوياً *</span>
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="اكتبي اسم المحافظة والمديرية / المنطقة هنا..."
                          className="w-full px-3.5 py-2 bg-white rounded-xl border border-amber-300 focus:border-brand-burgundy text-xs outline-none text-brand-text placeholder:text-gray-400"
                          value={customGovName}
                          onChange={(e) => setCustomGovName(e.target.value)}
                        />
                        <p className="text-[10px] text-amber-800 leading-relaxed">
                          في حال لم تجدي منطقتكِ في القائمة، اكتبيها وسنتواصل معكِ فوراً لتنسيق أفضل وسيلة شحن لعنوانكِ.
                        </p>
                      </div>
                    )}

                    {/* Shipping Method & Zone Information */}
                    <div className="space-y-1.5 pt-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">وسيلة التوصيل والشحن *</label>
                      <div className="space-y-2">
                        {isSanaaCity ? (
                          <>
                            <label className={cn(
                              "flex items-center justify-between p-3 rounded-2xl border cursor-pointer text-xs transition-all",
                              deliveryType === 'standard' ? 'bg-brand-blue/10 border-brand-blue font-bold text-brand-text' : 'bg-white border-brand-border text-brand-text hover:bg-brand-cream'
                            )}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="shipping"
                                  checked={deliveryType === 'standard'}
                                  onChange={() => setDeliveryType('standard')}
                                  className="accent-brand-blue"
                                />
                                <span>توصيل قياسي داخل صنعاء (خلال 24 ساعة)</span>
                              </div>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">مجاناً 🎁</span>
                            </label>

                            <label className={cn(
                              "flex items-center justify-between p-3 rounded-2xl border cursor-pointer text-xs transition-all",
                              deliveryType === 'express' ? 'bg-brand-blue/10 border-brand-blue font-bold text-brand-text' : 'bg-white border-brand-border text-brand-text hover:bg-brand-cream'
                            )}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="shipping"
                                  checked={deliveryType === 'express'}
                                  onChange={() => setDeliveryType('express')}
                                  className="accent-brand-blue"
                                />
                                <span>توصيل مستعجل (خلال 12 ساعة)</span>
                              </div>
                              <span className="font-sans font-bold">1,500 ر.ي</span>
                            </label>
                          </>
                        ) : isSanaaRural ? (
                          <div className="p-3 bg-white rounded-2xl border border-brand-border text-xs flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="font-bold text-brand-text block">توصيل ضواحي صنعاء (24 - 48 ساعة)</span>
                              <span className="text-[10px] text-brand-muted">متضمن ضواحي العاصمة المباشرة</span>
                            </div>
                            <span className="font-sans font-bold text-brand-text">1,500 ر.ي</span>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-brand-blue flex items-center gap-1.5">
                                <Truck className="w-4 h-4" />
                                <span>شحن إلى خارج صنعاء (عبر شركات النقل المعتمدة)</span>
                              </span>
                            </div>
                            <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100 text-[11px] text-brand-text leading-relaxed space-y-1">
                              <p className="font-bold text-brand-burgundy">
                                📢 تنبيه هام بخصوص تكلفة الشحن:
                              </p>
                              <p className="text-gray-700">
                                التوصيل المجاني متاح <strong className="text-brand-burgundy">فقط لسكان أمانة العاصمة صنعاء</strong>. تكاليف الشحن والتوصيل للمحافظات خارج صنعاء هي <strong>مبلغ منفصل</strong> عن إجمالي قيمة طلباتكِ، وسيتم التواصل معكِ هاتفياً من قبل الإدارة فور تأكيد الطلب لتحديد تفاصيل الشحن وسعر شركة النقل المناسبة لمدينتكِ.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">العنوان بالتفصيل *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder={selectedGov === 'other' ? "اكتبي عنوانكِ ورقم الشارع أو المعلم بالتفصيل الكامل..." : "اسم الحي، الشارع، أو معلم مميز..."}
                        className="w-full px-3.5 py-2.5 bg-brand-cream/40 rounded-xl border border-brand-border focus:border-brand-blue arabic-text text-xs outline-none text-brand-text resize-none"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    {/* Birthday Field with Skip Option */}
                    <div className="p-3 bg-brand-cream/60 rounded-2xl border border-brand-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text">
                          <span>🎂 تاريخ الميلاد (اختياري)</span>
                        </div>
                        {!birthdaySkipped && (
                          <button
                            type="button"
                            onClick={() => {
                              setBirthdaySkipped(true);
                              setFormData({ ...formData, birthday: '' });
                            }}
                            className="text-[11px] font-bold text-brand-muted hover:text-brand-text bg-white px-2.5 py-1 rounded-lg border border-brand-border hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            تخطي ✕
                          </button>
                        )}
                      </div>

                      {birthdaySkipped ? (
                        <div className="flex items-center justify-between text-[11px] text-brand-muted bg-white p-2 rounded-xl border border-brand-border">
                          <span>تم تخطي تسجيل تاريخ الميلاد</span>
                          <button
                            type="button"
                            onClick={() => setBirthdaySkipped(false)}
                            className="text-brand-blue font-bold hover:underline cursor-pointer"
                          >
                            إضافة تاريخ الميلاد
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-[10px] text-brand-muted leading-relaxed">
                            سجلي تاريخ ميلادكِ لتلقي هدية ومفاجأة خصم حصرية من «وِد» في يومكِ المميز! 🌸
                          </p>
                          <BirthdayInput
                            value={formData.birthday}
                            onChange={(val) => setFormData({ ...formData, birthday: val })}
                          />
                        </>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="arabic-text text-xs font-bold text-brand-text">طريقة الدفع *</label>
                        {isOutsideSanaa && (
                          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            الدفع المسبق مطلوب للمحافظات
                          </span>
                        )}
                      </div>

                      {/* Explicit Notice when user is outside Sanaa regarding Cash on Delivery rejection */}
                      {isOutsideSanaa && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-right text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>الدفع عند الاستلام غير متاح لموقعكِ:</span>
                          </div>
                          <p className="text-[11px] text-rose-700 leading-relaxed">
                            تم استبعاد خيار «الدفع عند الاستلام» لأن موقعكِ خارج مدينة صنعاء وضواحيها. الدفع عند الاستلام متاح حصرياً لسكان صنعاء فقط، ويلزم التحويل البنكي أو المحافظ الإلكترونية للطلبات المشحونة لباقي المحافظات.
                          </p>
                        </div>
                      )}

                      <select
                        value={paymentMethod}
                        onChange={(e: any) => setPaymentMethod(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-brand-cream/40 rounded-xl border border-brand-border focus:border-brand-blue text-xs outline-none text-brand-text cursor-pointer"
                      >
                        {/* Only show Cash on Delivery if in Sanaa City or Sanaa Rural */}
                        {isSanaaArea ? (
                          <option value="cash">الدفع نقداً عند الاستلام (صنعاء وضواحيها)</option>
                        ) : null}
                        <option value="transfer_kuraimi">تحويل بنكي - الكريمي</option>
                        <option value="transfer_jeeb">محفظة جيب الإلكترونية (Jeeb)</option>
                        <option value="transfer_floosak">تحويل إلكتروني - فلوسك</option>
                        <option value="transfer_onecash">تحويل إلكتروني - ون كاش</option>
                        <option value="transfer_bank">التحويل البنكي العادي (حوالة بنكية مباشرة)</option>
                      </select>

                      {paymentMethod !== 'cash' && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5 text-right text-brand-text">
                          <p className="font-bold text-amber-900 text-[11px]">بيانات الحساب للتحويل المالي:</p>
                          {paymentMethod === 'transfer_kuraimi' && (
                            <p className="font-mono text-xs font-bold text-brand-blue bg-white p-2 rounded-lg border border-amber-200">
                              {settings.kuraimi_account || 'الكريمي: 123456789 (باسم: ود)'}
                            </p>
                          )}
                          {paymentMethod === 'transfer_jeeb' && (
                            <p className="font-mono text-xs font-bold text-brand-blue bg-white p-2 rounded-lg border border-amber-200">
                              {settings.jeeb_account || 'محفظة جيب: 770000000'}
                            </p>
                          )}
                          {paymentMethod === 'transfer_floosak' && (
                            <p className="font-mono text-xs font-bold text-brand-blue bg-white p-2 rounded-lg border border-amber-200">
                              {settings.floosak_account || 'فلوسك: 770000000'}
                            </p>
                          )}
                          {paymentMethod === 'transfer_onecash' && (
                            <p className="font-mono text-xs font-bold text-brand-blue bg-white p-2 rounded-lg border border-amber-200">
                              {settings.onecash_account || 'ون كاش: 770000000'}
                            </p>
                          )}
                          {paymentMethod === 'transfer_bank' && (
                            <div className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-1 text-xs font-sans">
                              <div><span className="text-brand-muted text-[11px] font-sans">المستفيد: </span><strong className="text-brand-text">{settings.bank_transfer_name || 'مؤسسة وِد للعناية والتجميل'}</strong></div>
                              <div><span className="text-brand-muted text-[11px] font-sans">الحساب / الآيبان: </span><strong className="text-brand-blue font-mono">{settings.bank_transfer_account || '1020304050 / بنك التضامن'}</strong></div>
                            </div>
                          )}
                          <p className="text-[10px] text-brand-muted leading-normal">
                            يرجى إرسال إشعار أو سكرين التحويل عبر الواتساب لتأكيد الشحن الفوري.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="arabic-text text-xs font-bold text-brand-text">ملاحظات إضافية (اختياري)</label>
                      <input
                        type="text"
                        placeholder="أي تعليمات للمندوب..."
                        className="w-full px-3.5 py-2 bg-brand-cream/40 rounded-xl border border-brand-border text-xs outline-none text-brand-text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {/* Policy Links */}
                    <div className="text-[10px] text-brand-muted flex items-center justify-between pt-1">
                      <Link to="/shipping" target="_blank" className="hover:underline">سياسة الشحن</Link>
                      <span>•</span>
                      <Link to="/returns" target="_blank" className="hover:underline">الاسترجاع</Link>
                      <span>•</span>
                      <Link to="/privacy" target="_blank" className="hover:underline">الخصوصية</Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-brand-blue text-white rounded-2xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-blue/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      مراجعة وتأكيد الطلب ({finalTotal.toLocaleString()} ر.ي)
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 text-right">
                  <h2 className="arabic-text text-sm sm:text-base font-black text-brand-text pb-3 border-b border-brand-border">
                    ملخص الفاتورة
                  </h2>

                  {/* Coupon Input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="كود الخصم (WED10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-brand-cream/40 border border-brand-border rounded-xl text-xs uppercase outline-none focus:border-brand-blue text-brand-text"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold arabic-text hover:bg-brand-blue/90 transition-all cursor-pointer"
                    >
                      تطبيق
                    </button>
                  </form>
                  {couponMsg && (
                    <p className={`text-[11px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {couponMsg.text}
                    </p>
                  )}

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-brand-muted">
                      <span>قيمة المنتجات:</span>
                      <span className="font-sans font-bold text-brand-text">{totalPrice.toLocaleString()} ر.ي</span>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>الخصم ({discountPercent}%):</span>
                        <span className="font-sans">-{discountAmount.toLocaleString()} ر.ي</span>
                      </div>
                    )}

                    <div className="flex justify-between text-brand-muted">
                      <span>رسوم التوصيل:</span>
                      <span className="font-sans font-bold text-brand-text">
                        {isSanaaCity 
                          ? (deliveryType === 'express' ? '1,500 ر.ي (توصيل مستعجل)' : 'مجاني داخل صنعاء') 
                          : isSanaaRural 
                          ? '1,500 ر.ي (ضواحي صنعاء)' 
                          : 'منفصلة (يتم التنسيق هاتفياً)'}
                      </span>
                    </div>

                    {isOutsideSanaa && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-normal">
                        <strong>تنبيه:</strong> هذا الإجمالي لا يشمل أجور شركة الشحن خارج صنعاء.
                      </div>
                    )}

                    <div className="pt-3 border-t border-brand-border flex justify-between items-baseline text-base sm:text-lg font-black text-brand-text">
                      <span>{isOutsideSanaa ? 'إجمالي المنتجات المطلوب دفعها:' : 'الإجمالي النهائي:'}</span>
                      <span className="font-sans">{finalTotal.toLocaleString()} <small className="text-xs">ر.ي</small></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3.5 bg-brand-blue text-white rounded-2xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-blue/90 transition-all cursor-pointer shadow-xs"
                  >
                    متابعة إلى إتمام الطلب
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pre-submission confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-brand-border text-right space-y-4">
            <h3 className="text-base sm:text-lg font-black text-brand-text pb-2 border-b border-brand-border">
              تأكيد بيانات الطلب
            </h3>
            
            <div className="space-y-2 text-xs text-brand-text/90">
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">الاسم:</span>
                <strong className="text-brand-text">{formData.fullName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">رقم التواصل:</span>
                <strong className="text-brand-text font-mono">{formData.phone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">المدينة والعنوان:</span>
                <strong className="text-brand-text">
                  {selectedGov === 'other' ? customGovName : (YEMEN_GOVERNORATES.find(g => g.id === selectedGov)?.nameAr || selectedGov)} - {formData.address}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/40">
                <span className="text-brand-muted">طريقة الدفع:</span>
                <strong className="text-brand-text">
                  {paymentMethod === 'cash' ? 'الدفع نقداً عند الاستلام' : 'تحويل بنكي / إلكتروني'}
                </strong>
              </div>
              <div className="flex justify-between py-1 text-sm font-black text-brand-blue pt-1">
                <span>المبلغ المطلوب:</span>
                <span className="font-sans">{finalTotal.toLocaleString()} ر.ي</span>
              </div>
              {isOutsideSanaa && (
                <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  * هذا المبلغ خاص بالمنتجات. سيتم التواصل معكِ من الإدارة بخصوص تفاصيل وأجور الشحن والتوصيل.
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={executeOrderSubmission}
                disabled={isSubmitting}
                className="flex-1 bg-brand-blue text-white py-3 rounded-2xl text-xs font-bold hover:bg-brand-blue/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 bg-brand-cream text-brand-text border border-brand-border py-3 rounded-2xl text-xs font-bold hover:bg-brand-cream/80 transition-all cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
