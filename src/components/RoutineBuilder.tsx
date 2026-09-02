import React, { useState, useEffect } from 'react';
import { Layers, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

interface RoutineBuilderProps {
  products: Product[];
  initialStepCount?: 2 | 3;
  onClose?: () => void;
}

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  products,
  initialStepCount = 3,
  onClose
}) => {
  const { addToCart } = useCart();
  const [stepMode, setStepMode] = useState<2 | 3>(initialStepCount);
  
  // Step 1: Cleanser
  const [selectedCleanserId, setSelectedCleanserId] = useState<string>('');
  // Step 2: Moisturizer / Serum
  const [selectedMoisturizerId, setSelectedMoisturizerId] = useState<string>('');
  // Step 3: Sunscreen / Protection (Optional in 3-step mode)
  const [selectedSunscreenId, setSelectedSunscreenId] = useState<string>('');
  const [includeStep3, setIncludeStep3] = useState<boolean>(initialStepCount === 3);

  const [addedFeedback, setAddedFeedback] = useState(false);

  // Filter available products by step from existing catalog
  const cleansers = products.filter(p => p.step === 'cleanser' || p.category === 'cleansers' || p.id === 'wed-103');
  const moisturizers = products.filter(p => p.step === 'moisturizer' || p.step === 'serum' || p.category === 'moisturizers' || p.category === 'serums' || p.id === 'wed-102' || p.id === 'wed-101');
  const sunscreens = products.filter(p => p.step === 'sunscreen' || p.category === 'sun-care' || p.goal === 'protection' || p.id === '5');

  // Set default items on initial load
  useEffect(() => {
    if (cleansers.length > 0 && !selectedCleanserId) {
      setSelectedCleanserId(cleansers[0].id || cleansers[0].productId || '');
    }
    if (moisturizers.length > 0 && !selectedMoisturizerId) {
      setSelectedMoisturizerId(moisturizers[0].id || moisturizers[0].productId || '');
    }
    if (sunscreens.length > 0 && !selectedSunscreenId) {
      setSelectedSunscreenId(sunscreens[0].id || sunscreens[0].productId || '');
    }
  }, [products]);

  const activeCleanser = cleansers.find(p => (p.id === selectedCleanserId || p.productId === selectedCleanserId));
  const activeMoisturizer = moisturizers.find(p => (p.id === selectedMoisturizerId || p.productId === selectedMoisturizerId));
  const activeSunscreen = sunscreens.find(p => (p.id === selectedSunscreenId || p.productId === selectedSunscreenId));

  // Determine selected products in routine
  const selectedProducts: Product[] = [];
  if (activeCleanser) selectedProducts.push(activeCleanser);
  if (activeMoisturizer) selectedProducts.push(activeMoisturizer);
  if (stepMode === 3 && includeStep3 && activeSunscreen) selectedProducts.push(activeSunscreen);

  const totalPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const isValidRoutine = selectedProducts.length >= 2;

  const handleAddRoutineToCart = () => {
    if (!isValidRoutine) return;
    selectedProducts.forEach(prod => {
      addToCart(prod);
    });
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-brand-border p-5 sm:p-7 text-right shadow-xs space-y-6 text-brand-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cream text-brand-burgundy rounded-full text-xs font-black border border-brand-border mb-2">
            <Layers className="w-3.5 h-3.5 text-brand-gold" />
            <span>منشئ الروتين المخصص من «ود»</span>
          </div>
          <h3 className="arabic-text text-xl sm:text-2xl font-black text-brand-burgundy">
            صممي روتينكِ اليومي المخصص
          </h3>
          <p className="arabic-text text-xs sm:text-sm text-brand-text-muted mt-1">
            اختاري مستحضراتكِ الأساسية من منتجات ود وأضيفيها معاً إلى سلتكِ بنقرة واحدة
          </p>
        </div>

        {/* Step Mode Toggle */}
        <div className="flex items-center bg-[#FAF6F0] p-1 rounded-2xl border border-brand-border shrink-0">
          <button
            onClick={() => {
              setStepMode(2);
              setIncludeStep3(false);
            }}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-black arabic-text transition-all cursor-pointer",
              stepMode === 2
                ? "bg-brand-burgundy text-white shadow-xs"
                : "text-brand-text-muted hover:text-brand-burgundy"
            )}
          >
            روتين من خطوتين (تنظيف + ترطيب)
          </button>
          <button
            onClick={() => {
              setStepMode(3);
              setIncludeStep3(true);
            }}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-black arabic-text transition-all cursor-pointer",
              stepMode === 3
                ? "bg-brand-burgundy text-white shadow-xs"
                : "text-brand-text-muted hover:text-brand-burgundy"
            )}
          >
            روتين من 3 خطوات (تنظيف + ترطيب + حماية)
          </button>
        </div>
      </div>

      {/* Steps Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Cleanse (Mandatory) */}
        <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black bg-brand-burgundy text-white px-2 py-0.5 rounded-full">
                الخطوة 1: التنظيف
              </span>
              <span className="text-[10px] text-brand-gold font-bold">إلزامي بالروتين</span>
            </div>

            {cleansers.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-burgundy">اختاري منظف البشرة:</label>
                <select
                  value={selectedCleanserId}
                  onChange={(e) => setSelectedCleanserId(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-burgundy outline-none focus:border-brand-burgundy"
                >
                  {cleansers.map(c => (
                    <option key={c.id || c.productId} value={c.id || c.productId} className="bg-white text-brand-burgundy">
                      {c.nameAr} - {Number(c.price).toLocaleString()} ر.ي
                    </option>
                  ))}
                </select>

                {activeCleanser && (
                  <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-brand-border mt-2 shadow-2xs">
                    <img
                      src={activeCleanser.images?.[0]}
                      alt={activeCleanser.nameAr}
                      className="w-12 h-12 rounded-lg object-cover border border-brand-border shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <h4 className="arabic-text font-black text-xs text-brand-burgundy line-clamp-1">{activeCleanser.nameAr}</h4>
                      <p className="text-[10px] text-brand-text-muted line-clamp-1">{activeCleanser.recommendationReason || activeCleanser.descriptionAr}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted">لا يوجد منتج تنظيف متوفر حالياً في الكتالوج.</p>
            )}
          </div>
        </div>

        {/* Step 2: Moisturize / Serum (Mandatory) */}
        <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black bg-brand-burgundy text-white px-2 py-0.5 rounded-full">
                الخطوة 2: الترطيب والنضارة
              </span>
              <span className="text-[10px] text-brand-gold font-bold">إلزامي بالروتين</span>
            </div>

            {moisturizers.length > 0 ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-burgundy">اختاري المرطب أو السيروم:</label>
                <select
                  value={selectedMoisturizerId}
                  onChange={(e) => setSelectedMoisturizerId(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-burgundy outline-none focus:border-brand-burgundy"
                >
                  {moisturizers.map(m => (
                    <option key={m.id || m.productId} value={m.id || m.productId} className="bg-white text-brand-burgundy">
                      {m.nameAr} - {Number(m.price).toLocaleString()} ر.ي
                    </option>
                  ))}
                </select>

                {activeMoisturizer && (
                  <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-brand-border mt-2 shadow-2xs">
                    <img
                      src={activeMoisturizer.images?.[0]}
                      alt={activeMoisturizer.nameAr}
                      className="w-12 h-12 rounded-lg object-cover border border-brand-border shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <h4 className="arabic-text font-black text-xs text-brand-burgundy line-clamp-1">{activeMoisturizer.nameAr}</h4>
                      <p className="text-[10px] text-brand-text-muted line-clamp-1">{activeMoisturizer.recommendationReason || activeMoisturizer.descriptionAr}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted">لا يوجد منتج ترطيب متوفر حالياً.</p>
            )}
          </div>
        </div>

        {/* Step 3: Protection (Optional in 3-step mode) */}
        {stepMode === 3 && (
          <div className="p-4 bg-brand-cream rounded-2xl border border-brand-border flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black bg-brand-burgundy text-white px-2 py-0.5 rounded-full">
                  الخطوة 3: الحماية اليومية
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-brand-burgundy font-bold">
                  <input
                    type="checkbox"
                    checked={includeStep3}
                    onChange={(e) => setIncludeStep3(e.target.checked)}
                    className="rounded accent-brand-burgundy"
                  />
                  <span>تضمين في الروتين</span>
                </label>
              </div>

              {includeStep3 ? (
                sunscreens.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-burgundy">اختاري واقي الشمس:</label>
                    <select
                      value={selectedSunscreenId}
                      onChange={(e) => setSelectedSunscreenId(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-burgundy outline-none focus:border-brand-burgundy"
                    >
                      {sunscreens.map(s => (
                        <option key={s.id || s.productId} value={s.id || s.productId} className="bg-white text-brand-burgundy">
                          {s.nameAr} - {Number(s.price).toLocaleString()} ر.ي
                        </option>
                      ))}
                    </select>

                    {activeSunscreen && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-brand-border mt-2 shadow-2xs">
                        <img
                          src={activeSunscreen.images?.[0]}
                          alt={activeSunscreen.nameAr}
                          className="w-12 h-12 rounded-lg object-cover border border-brand-border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1 text-right">
                          <h4 className="arabic-text font-black text-xs text-brand-burgundy line-clamp-1">{activeSunscreen.nameAr}</h4>
                          <p className="text-[10px] text-brand-text-muted line-clamp-1">{activeSunscreen.recommendationReason || activeSunscreen.descriptionAr}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-brand-text-muted">لا يوجد واقي شمس متاح حالياً.</p>
                )
              ) : (
                <div className="p-4 bg-white rounded-xl border border-brand-border text-center text-xs text-brand-text-muted">
                  تم تخطي خطوة الحماية لهذه الباقة.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Routine Summary & Cart CTA */}
      <div className="bg-brand-cream p-4 sm:p-5 rounded-2xl border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-brand-burgundy font-bold block">
            المحتويات المختارة بالروتين ({selectedProducts.length} مستحضرات):
          </span>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {selectedProducts.map((p, idx) => (
              <span key={idx} className="text-xs font-bold text-brand-burgundy bg-white px-2.5 py-1 rounded-lg border border-brand-border shadow-2xs">
                {p.nameAr}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] text-brand-text-muted block">إجمالي باقة الروتين:</span>
            <span className="text-lg font-black text-brand-burgundy font-sans">
              {totalPrice.toLocaleString()} <small className="arabic-text text-xs text-brand-text-muted">ر.ي</small>
            </span>
          </div>

          <button
            onClick={handleAddRoutineToCart}
            disabled={!isValidRoutine}
            className={cn(
              "px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black arabic-text transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer",
              isValidRoutine
                ? "bg-brand-burgundy text-white hover:bg-brand-burgundy-light hover:text-brand-gold-light"
                : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
            )}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تمت إضافة الباقة للسلة بنجاح</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-brand-gold-light" />
                <span>إضافة الباقة إلى السلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
