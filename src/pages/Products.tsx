import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, getPublishedProducts } from '../data';
import { ProductCard } from '../components/ProductCard';
import { Search, Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'rating'>('default');

  // Debounce search query 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        const published = getPublishedProducts();
        
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
            price: Number(p.price_after) || Number(p.price_before) || 0,
            priceBefore: p.price_before ? Number(p.price_before) : undefined,
            discountPercent: 0,
            imageUrl: p.images?.[0] || '',
            gallery: p.images || [],
            images: p.images || [],
            stock: Number(p.stock) || 0,
            category: p.category,
            skinType: p.skin_type || 'all',
            goal: p.goal || 'glow',
            badge: p.badge,
            published: true,
            isFeatured: true,
            isNew: true
          })) as any;

          const combined = [...published];
          formatted.forEach(fp => {
            if (!combined.some(cp => cp.id === fp.id || cp.productId === fp.productId)) {
              combined.push(fp);
            }
          });
          
          setProducts(combined);
        } else {
          setProducts(published);
        }
      } catch (err) {
        setProducts(getPublishedProducts());
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchInput) {
      setSearchInput(q);
      setDebouncedQuery(q);
    }
    const cat = searchParams.get('category');
    if (cat !== null) {
      setSelectedCategory(cat === 'all' ? null : cat);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category === selectedCategory || 
        (selectedCategory === 'bundles' && (p.category === 'bundles' || p.badge?.includes('باقة')))
      );
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      result = result.filter(p => 
        p.nameAr?.toLowerCase().includes(q) || 
        p.nameEn?.toLowerCase().includes(q) ||
        p.descriptionAr?.toLowerCase().includes(q) ||
        p.shortDescriptionAr?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 5) - (a.rating || 5));

    return result;
  }, [products, selectedCategory, debouncedQuery, sortBy]);

  const handleCategoryClick = (catId: string | null) => {
    const target = catId === 'all' ? null : catId;
    setSelectedCategory(target);
    const newParams: Record<string, string> = {};
    if (target) newParams.category = target;
    if (debouncedQuery) newParams.q = debouncedQuery;
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSearchInput('');
    setDebouncedQuery('');
    setSearchParams({});
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-cream min-h-screen text-brand-text">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-right space-y-1">
          <h1 className="arabic-text text-2xl sm:text-3xl font-black text-brand-text flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-blue" />
            <span>مستحضرات وِد للعناية الفاخرة</span>
          </h1>
          <p className="arabic-text text-brand-muted text-xs sm:text-sm">
            تركيبات صيدلانية معتمدة ومختبرة لتعزيز نضارة وجمال بشرتكِ
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-3.5 sm:p-5 rounded-3xl shadow-xs mb-6 flex flex-col gap-3.5 border border-brand-border">
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
              <input
                type="text"
                placeholder="ابحثي باسم المستحضر أو المكون..."
                className="w-full pr-10 pl-4 py-2.5 bg-brand-cream/50 border border-brand-border rounded-xl focus:border-brand-blue arabic-text text-xs text-brand-text outline-none transition-colors"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-brand-cream/50 border border-brand-border rounded-xl text-xs font-bold text-brand-text outline-none cursor-pointer flex-1 sm:flex-none"
              >
                <option value="default">الترتيب: الافتراضي</option>
                <option value="priceAsc">السعر: من الأقل للأعلى</option>
                <option value="priceDesc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>

              {(selectedCategory || debouncedQuery) && (
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 bg-brand-pink/60 text-brand-burgundy border border-brand-pink rounded-xl text-xs font-bold arabic-text hover:bg-brand-pink transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>مسح الفلاتر</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-brand-border/60">
            <button
              onClick={() => handleCategoryClick(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                !selectedCategory
                  ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                  : "bg-white text-brand-text border-brand-border hover:bg-brand-cream"
              )}
            >
              جميع المنتجات ({products.length})
            </button>
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = products.filter(p => p.category === cat.id || (cat.id === 'bundles' && (p.category === 'bundles' || p.badge?.includes('باقة')))).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                    isSelected
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                      : "bg-white text-brand-text border-brand-border hover:bg-brand-cream"
                  )}
                >
                  {cat.nameAr} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-2" />
            <p className="arabic-text text-xs text-brand-muted">جاري تحميل المستحضرات...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.productId} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-brand-border shadow-xs space-y-3 max-w-md mx-auto">
            <h3 className="arabic-text text-base font-black text-brand-text">لم نجد مستحضرات مطابقة للبحث</h3>
            <p className="arabic-text text-xs text-brand-muted">جرّبي البحث بكلمات أخرى أو عرض كافة الفئات</p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold arabic-text hover:bg-brand-blue/90 transition-all cursor-pointer"
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
