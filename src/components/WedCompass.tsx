import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, X, ChevronLeft, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface WedCompassProps {
  products: Product[];
  onOpenRoutineBuilder?: (stepCount: 2 | 3) => void;
  onFilterCategory?: (category: string) => void;
}

type CompassChoice = 'hydration' | 'oil_control' | 'beginner' | 'sun_defense';

interface CompassOption {
  id: CompassChoice;
  title: string;
  subtitle: string;
  iconName: string;
}

const COMPASS_OPTIONS: CompassOption[] = [
  { id: 'hydration', title: 'ترطيب', subtitle: 'ترميم حاجز البشرة وتهدئة الجفاف', iconName: 'Droplets' },
  { id: 'oil_control', title: 'تقليل اللمعان', subtitle: 'تنقية المسام وموازنة الإفرازات', iconName: 'Flame' },
  { id: 'beginner', title: 'روتين مبتدئ', subtitle: 'خطوات نقية ومختصرة للبداية اليومية', iconName: 'Sparkles' },
  { id: 'sun_defense', title: 'حماية يومية', subtitle: 'درع شفاف وخفيف ضد أشعة الشمس', iconName: 'Sun' },
];

export const WedCompass: React.FC<WedCompassProps> = ({
  products,
  onOpenRoutineBuilder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<CompassChoice | null>(null);

  const getSuggestedProducts = (choice: CompassChoice): Product[] => {
    switch (choice) {
      case 'hydration':
        return products
          .filter(p => p.goal === 'hydration' || p.goal === 'barrier_repair' || p.category === 'moisturizers')
          .slice(0, 3);
      case 'oil_control':
        return products
          .filter(p => p.skinType === 'oily' || p.skinType === 'combination' || p.category === 'masks' || p.category === 'cleansers')
          .slice(0, 3);
      case 'beginner':
        return products
          .filter(p => p.id === 'wed-103' || p.id === 'wed-102' || p.category === 'cleansers' || p.category === 'moisturizers')
          .slice(0, 3);
      case 'sun_defense':
        return products
          .filter(p => p.category === 'sun-care' || p.goal === 'protection' || p.id === '5')
          .slice(0, 3);
      default:
        return products.slice(0, 3);
    }
  };

  const getChoiceReason = (choice: CompassChoice, product: Product): string => {
    if (product.recommendationReason) return product.recommendationReason;
    switch (choice) {
      case 'hydration':
        return 'مركب مغذٍ يعزز رطوبة البشرة ويمنع الشد والجفاف.';
      case 'oil_control':
        return 'تركيبة لطيفة توازن إفراز الدهون وتنقي المسام دون تجفيف.';
      case 'beginner':
        return 'خطوة أساسية سهلة التطبيق تناسب البدايات اليومية للعناية.';
      case 'sun_defense':
        return 'حماية يومية شفافة وسريعة الامتصاص لحماية خلايا البشرة.';
    }
  };

  const suggestedProducts = selectedChoice ? getSuggestedProducts(selectedChoice) : [];

  return (
    <div className="relative">
      {/* Compact Entry Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black arabic-text transition-all border shadow-xs cursor-pointer",
          isOpen
            ? "bg-brand-cream text-brand-burgundy border-brand-border"
            : "bg-brand-burgundy text-white border-brand-burgundy hover:bg-brand-burgundy-light hover:text-brand-gold-light"
        )}
      >
        <Compass className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-90 text-brand-gold" : "text-brand-gold-light")} />
        <span>بوصلة وِد</span>
        <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-black">
          مساعد سريع
        </span>
      </button>

      {/* Discrete Dropdown / Modal Flyout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="mt-3 bg-white border border-brand-border rounded-3xl p-4 sm:p-5 shadow-xl text-right z-30 space-y-4 text-brand-text"
          >
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-cream text-brand-burgundy flex items-center justify-center border border-brand-border">
                  <Compass className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h4 className="arabic-text font-black text-xs sm:text-sm text-brand-burgundy">
                    بوصلة وِد: ما الذي تريدينه اليوم؟
                  </h4>
                  <span className="text-[11px] text-brand-text-muted">
                    اختاري هدفكِ لعرض حتى 3 منتجات مقترحة فوراً
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-brand-text-muted hover:text-brand-burgundy hover:bg-brand-cream rounded-lg transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMPASS_OPTIONS.map((opt) => {
                const isSelected = selectedChoice === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedChoice(opt.id)}
                    className={cn(
                      "p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer",
                      isSelected
                        ? "bg-brand-burgundy text-white border-brand-burgundy shadow-xs"
                        : "bg-[#FAF6F0] text-brand-text border-brand-border hover:bg-white"
                    )}
                  >
                    <span className="arabic-text font-black text-xs">
                      {opt.title}
                    </span>
                    <span className={cn(
                      "arabic-text text-[10px] line-clamp-2 mt-1",
                      isSelected ? "text-brand-gold-light font-bold" : "text-brand-text-muted"
                    )}>
                      {opt.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Suggested Products Box (up to 3) */}
            {selectedChoice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2 border-t border-brand-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand-burgundy">
                    الترشيحات المقترحة من كتالوج وِد ({suggestedProducts.length}):
                  </span>
                  <button
                    onClick={() => {
                      setSelectedChoice(null);
                    }}
                    className="text-[11px] text-brand-gold hover:text-brand-burgundy font-bold cursor-pointer transition-colors"
                  >
                    تغيير الاختيار
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {suggestedProducts.map((prod) => (
                    <div
                      key={prod.id || prod.productId}
                      className="p-3 bg-[#FAF6F0] rounded-2xl border border-brand-border flex flex-col justify-between text-right space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1608248597359-0a62372f8830?auto=format&fit=crop&q=80&w=800'}
                          alt={prod.nameAr}
                          className="w-12 h-12 rounded-xl object-cover border border-brand-border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="arabic-text font-bold text-xs text-brand-burgundy line-clamp-1">
                            {prod.nameAr}
                          </h5>
                          <span className="text-[11px] font-sans font-black text-brand-burgundy block mt-0.5">
                            {Number(prod.price).toLocaleString()} ر.ي
                          </span>
                        </div>
                      </div>

                      <p className="arabic-text text-[10px] text-brand-text-muted bg-white p-2 rounded-xl border border-brand-border leading-relaxed">
                        {getChoiceReason(selectedChoice, prod)}
                      </p>

                      <Link
                        to={`/products/${prod.id || prod.productId}`}
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-brand-burgundy text-white py-1.5 rounded-xl text-[11px] font-black arabic-text hover:bg-brand-burgundy-light hover:text-brand-gold-light transition-all flex items-center justify-center gap-1"
                      >
                        <span>معاينة المنتج</span>
                        <ChevronLeft className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-gold hover:text-brand-burgundy flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>عرض كل المنتجات في المتجر</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>

                  {onOpenRoutineBuilder && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenRoutineBuilder(selectedChoice === 'beginner' ? 2 : 3);
                      }}
                      className="text-xs font-black text-white bg-brand-burgundy px-3 py-1.5 rounded-xl hover:bg-brand-burgundy-light hover:text-brand-gold-light transition-all cursor-pointer shadow-2xs"
                    >
                      تنسيق كباقة روتين ➔
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
