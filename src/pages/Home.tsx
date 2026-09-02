import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, RefreshCcw, Sparkles, ShieldCheck, Truck, Clock, 
  ChevronLeft, ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES, MOCK_PRODUCTS_LIST } from '../data';
import { ProductCard } from '../components/ProductCard';
import { SkinQuizCard } from '../components/SkinQuizCard';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/useSettings';
import { WedLogo } from '../components/WedLogo';
import { Product, SkinType } from '../types';

export const Home: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS_LIST);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSkinFilter, setActiveSkinFilter] = useState<string | null>(null);
  const [activeFilterLabel, setActiveFilterLabel] = useState<string>('');

  const { settings } = useSettings();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        const formatted: Product[] = data.map(p => ({
          id: p.id,
          productId: p.product_id || p.id,
          nameAr: p.name_ar,
          nameEn: p.name_en,
          descriptionAr: p.description_ar,
          descriptionEn: p.description_en,
          ingredientsAr: p.ingredients_ar,
          usageAr: p.usage_ar,
          precautionsAr: p.precautions_ar,
          size: p.size || '50 مل',
          price: Number(p.price_after) || Number(p.price_before),
          priceBefore: p.price_before ? Number(p.price_before) : null,
          category: p.category || 'serums',
          skinType: p.skin_type || 'all',
          goal: p.goal || 'glow',
          step: p.step || 'serum',
          recommendationReason: p.recommendation_reason || 'تركيبة صيدلانية نقية لترميم وترطيب البشرة',
          badge: p.badge,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1608248597359-0a62372f8830?auto=format&fit=crop&q=80&w=800'],
          stock: p.stock !== undefined ? Number(p.stock) : 20,
          rating: Number(p.rating) || 5.0,
          reviewsCount: Number(p.reviews_count) || 12,
          isFeatured: p.is_featured ?? true,
          isNew: p.is_new ?? true
        }));
        
        const combined = [...MOCK_PRODUCTS_LIST];
        formatted.forEach(fp => {
          if (!combined.some(cp => cp.id === fp.id || cp.productId === fp.productId)) {
            combined.push(fp);
          }
        });
        setAllProducts(combined);
      }
    } catch (err) {
      // Fallback
    }
  };

  // Live Filtering
  useEffect(() => {
    let result = [...allProducts];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory || (selectedCategory === 'bundles' && (p.category === 'bundles' || p.badge?.includes('باقة'))));
    }

    // Skin Test Filter
    if (activeSkinFilter) {
      result = result.filter(p => p.skinType === 'all' || p.skinType === activeSkinFilter || (activeSkinFilter === 'combination' && (p.skinType === 'oily' || p.skinType === 'all')));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.nameAr.toLowerCase().includes(q) || 
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.descriptionAr.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, activeSkinFilter, searchQuery]);

  const handleApplySkinQuizFilter = (skinType: SkinType, filterLabel: string) => {
    setActiveSkinFilter(skinType);
    setActiveFilterLabel(filterLabel);
    setSelectedCategory('all');
    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleResetFilter = () => {
    setActiveSkinFilter(null);
    setActiveFilterLabel('');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="pt-20 bg-brand-bg min-h-screen text-brand-text">
      
      {/* 1. HERO & CONTROLS HEADER */}
      <section className="pt-4 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Visual Banner */}
          <div className="relative aspect-[16/8] sm:aspect-[21/8] w-full rounded-3xl overflow-hidden border border-brand-border shadow-xs bg-white">
            <img
              src={settings.bg_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070"}
              alt={settings.store_name || "ود للعناية بالبشرة"}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#233446]/85 via-[#233446]/40 to-transparent flex flex-col justify-end p-5 sm:p-7 text-right text-white">
              <span className="text-[11px] font-bold text-brand-pink bg-brand-blue/30 px-3 py-0.5 rounded-full w-fit mb-1 border border-white/20">
                {settings.store_slogan || "العناية الموثوقة بالبشرة"}
              </span>
              <h1 className="arabic-text text-xl sm:text-3xl font-black text-white leading-tight">
                {settings.store_name ? `عالم ${settings.store_name} للعناية` : 'جمالٌ يفيض نضارةً وترطيباً'}
              </h1>
              <p className="arabic-text text-xs sm:text-sm text-white/90 font-medium mt-1 max-w-xl line-clamp-1">
                {settings.article_text || `مستحضرات ${settings.store_name || 'ود'} النقية لتدليل بشرتكِ وإبراز إشراقتها اليومية.`}
              </p>
            </div>
          </div>

          {/* Compact Skin Quiz Helper Bar */}
          <SkinQuizCard
            onApplyFilter={handleApplySkinQuizFilter}
            onResetFilter={handleResetFilter}
            activeFilterSkinType={activeSkinFilter}
          />

          {/* Visual Category Cards with Dynamic Images - Infinite Looping Marquee Moving Slowly to the Right */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-brand-text arabic-text">تصنيفات المستحضرات:</span>
                <span className="text-[10px] text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full font-bold arabic-text hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                  دوران مستمر (توقفي لاختيار الفئة)
                </span>
              </div>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] font-bold text-brand-blue hover:underline arabic-text cursor-pointer"
                >
                  عرض الكل
                </button>
              )}
            </div>

            {/* Continuous Infinite Marquee Loop (Moving smoothly to the right) */}
            <div className="marquee-container-ltr rounded-2xl py-1">
              {/* Subtle edge fading gradients */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-brand-bg to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-brand-bg to-transparent z-10" />

              {/* Looping Track with 2 continuous sets for seamless loop */}
              <div className="marquee-content-track items-center gap-3">
                {[...CATEGORIES, ...CATEGORIES].map((cat, idx) => {
                  const isSelected = selectedCategory === cat.id && !activeSkinFilter && !searchQuery.trim();
                  const catImg = settings.category_images?.[cat.id] || cat.image;

                  return (
                    <button
                      dir="rtl"
                      key={`${cat.id}-loop-${idx}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveSkinFilter(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-white border-2 border-brand-blue shadow-xs scale-105'
                          : 'bg-white/95 border border-brand-border hover:bg-white hover:border-brand-blue/60 hover:shadow-xs'
                      }`}
                      style={{ width: '84px', minWidth: '84px' }}
                    >
                      {/* Category Image Thumbnail */}
                      <div className={`w-14 h-14 rounded-xl overflow-hidden border ${
                        isSelected ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-[#EADBCE]'
                      } bg-[#FAF6F0] flex items-center justify-center`}>
                        {catImg ? (
                          <img
                            src={catImg}
                            alt={cat.nameAr}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Sparkles className="w-6 h-6 text-brand-blue" />
                        )}
                      </div>

                      <span className={`text-[11px] font-black arabic-text text-center whitespace-nowrap ${
                        isSelected ? 'text-brand-blue' : 'text-brand-text'
                      }`}>
                        {cat.nameAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DIRECT PRODUCTS GRID */}
      <section id="products-section" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-brand-border">
        
        {/* Section Title & Status */}
        <div className="flex items-center justify-between mb-5 text-right">
          <div>
            <h2 className="arabic-text text-lg sm:text-xl font-black text-brand-text">
              {searchQuery.trim()
                ? `نتائج البحث عن: «${searchQuery}»`
                : activeSkinFilter
                ? `المستحضرات المناسبة لـ: ${activeFilterLabel || activeSkinFilter}`
                : selectedCategory !== 'all'
                ? `قسم ${CATEGORIES.find(c => c.id === selectedCategory)?.nameAr || ''}`
                : 'جميع المستحضرات'}
            </h2>
            <span className="text-xs text-brand-text-muted font-bold">
              ({filteredProducts.length} منتج متاح)
            </span>
          </div>

          {(activeSkinFilter || searchQuery.trim() || selectedCategory !== 'all') && (
            <button
              onClick={handleResetFilter}
              className="text-xs text-brand-blue hover:text-brand-blue-dark font-bold flex items-center gap-1 bg-brand-blue/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>عرض كل المنتجات</span>
            </button>
          )}
        </div>

        {/* 2-Column Product Grid (Mobile) & 4-Column (Desktop) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id || product.productId}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-brand-border shadow-2xs space-y-3 max-w-md mx-auto">
            <h3 className="arabic-text text-sm sm:text-base font-black text-brand-text">
              لا توجد منتجات مطابقة لهذا البحث
            </h3>
            <p className="arabic-text text-xs text-brand-text-muted">
              جرّبي البحث بكلمات أخرى أو تصفحي كامل المنتجات.
            </p>
            <button
              onClick={handleResetFilter}
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold arabic-text hover:bg-brand-blue-dark transition-all cursor-pointer shadow-xs"
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </section>

      {/* 3. SIMPLIFIED 3-STEP ORDER GUIDE */}
      <section className="py-10 bg-white border-t border-brand-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="arabic-text text-lg sm:text-xl font-black text-brand-text">
              طريقة الطلب في 3 خطوات بسيطة
            </h3>
            <p className="arabic-text text-xs text-brand-text-muted mt-1">
              تسوق سريع ومباشر مع توصيل فوري داخل صنعاء والمحافظات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F7F9FA] rounded-2xl border border-brand-border text-right flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h4 className="arabic-text text-xs sm:text-sm font-black text-brand-text">اختاري منتجكِ</h4>
                <p className="arabic-text text-[11px] text-brand-text-muted mt-0.5 leading-relaxed">
                  تصفحي المستحضرات واضغطي «أضف إلى السلة».
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9FA] rounded-2xl border border-brand-border text-right flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="arabic-text text-xs sm:text-sm font-black text-brand-text">سجلي بيانات التوصيل</h4>
                <p className="arabic-text text-[11px] text-brand-text-muted mt-0.5 leading-relaxed">
                  أدخلي اسمكِ ورقم هاتفكِ وعنوانكِ في السلة.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F7F9FA] rounded-2xl border border-brand-border text-right flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="arabic-text text-xs sm:text-sm font-black text-brand-text">استلام ودفع مريح</h4>
                <p className="arabic-text text-[11px] text-brand-text-muted mt-0.5 leading-relaxed">
                  استلمي طلبكِ وادفعي نقداً أو عبر الحوالات والمحافظ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
