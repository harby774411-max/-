import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findProduct, PRODUCTS } from '../data';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ArrowRight, ShieldCheck, Truck, RefreshCcw, Loader2, Sparkles, Check, Heart, Share2, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { NotFoundPage } from './PolicyPages';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'usage' | 'reviews'>('info');
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProd = async () => {
      setLoading(true);
      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      let found = findProduct(id);
      
      if (!found) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
            
          if (data && !error) {
            found = {
              id: data.id,
              productId: data.product_id || data.id,
              nameAr: data.name_ar,
              nameEn: data.name_en,
              descriptionAr: data.description_ar,
              descriptionEn: data.description_en,
              ingredientsAr: data.ingredients_ar,
              usageAr: data.usage_ar,
              precautionsAr: data.precautions_ar,
              size: data.size || '50 مل',
              price: Number(data.price_after) || Number(data.price_before),
              priceBefore: data.price_before ? Number(data.price_before) : undefined,
              discountPercent: 0,
              imageUrl: data.images?.[0] || '',
              gallery: data.images || [],
              images: data.images || [],
              stock: Number(data.stock) || 0,
              category: data.category,
              skinType: data.skin_type || 'all',
              goal: data.goal || 'glow',
              badge: data.badge,
              published: true,
              isFeatured: true,
              isNew: true
            } as Product;
          }
        } catch (e) {
          // ignore
        }
      }

      if (found) {
        // Safe check for price mapping if found in localStorage but unmapped
        if ((found as any).name_ar && !found.nameAr) {
          found = {
             id: found.id,
             nameAr: (found as any).name_ar,
             nameEn: (found as any).name_en,
             descriptionAr: (found as any).description_ar,
             ingredientsAr: (found as any).ingredients_ar,
             usageAr: (found as any).usage_ar,
             size: found.size || '50 مل',
             price: Number((found as any).price_after) || Number((found as any).price_before) || 0,
             priceBefore: (found as any).price_before ? Number((found as any).price_before) : undefined,
             imageUrl: found.images?.[0] || '',
             gallery: found.images || [],
             images: found.images || [],
             stock: Number(found.stock) || 0,
             category: found.category,
             badge: found.badge
          } as any;
        }

        setProduct(found);
        const img = found.imageUrl || (found.images && found.images[0]) || '';
        setSelectedImage(img);
      } else {
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProd();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShareProduct = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nameAr,
          text: `شاهدي مستحضر «${product.nameAr}» في متجر وِد للعناية بالبشرة 🌸`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="pt-36 pb-20 flex items-center justify-center min-h-[60vh] bg-brand-cream">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!product) {
    return <NotFoundPage />;
  }

  const galleryImages = (product.gallery && product.gallery.length > 0) 
    ? product.gallery 
    : (product.images && product.images.length > 0) 
      ? product.images 
      : [product.imageUrl];

  const discountVal = (product.compareAtPrice && product.compareAtPrice > product.price)
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : (product.priceBefore && product.priceBefore > product.price)
      ? Math.round(((product.priceBefore - product.price) / product.priceBefore) * 100)
      : product.discountPercent || 0;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-cream min-h-screen text-brand-text">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 arabic-text text-xs mb-6 text-brand-muted overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-brand-blue transition-colors">الرئيسية</Link>
          <ArrowRight size={12} className="rotate-180 text-brand-muted/70" />
          <Link to="/products" className="hover:text-brand-blue transition-colors">المنتجات</Link>
          <ArrowRight size={12} className="rotate-180 text-brand-muted/70" />
          <span className="text-brand-text font-black">{product.nameAr}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs relative flex items-center justify-center"
            >
              {product.badge && (
                <span className="absolute top-4 right-4 z-10 text-xs font-bold text-white bg-brand-blue px-3 py-1 rounded-xl shadow-xs">
                  {product.badge}
                </span>
              )}
              {discountVal > 0 && (
                <span className="absolute top-4 left-4 z-10 text-xs font-bold text-brand-burgundy bg-brand-pink/60 border border-brand-pink px-2.5 py-1 rounded-xl">
                  وفرتي {discountVal}%
                </span>
              )}
              <img
                src={selectedImage || product.imageUrl || product.images?.[0]}
                alt={product.nameAr}
                className="w-full h-full object-cover transition-all duration-300"
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>
            
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {galleryImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      "aspect-square bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer p-0.5",
                      selectedImage === img ? "border-brand-blue ring-2 ring-brand-blue/30" : "border-brand-border hover:border-brand-blue/60"
                    )}
                  >
                    <img src={img} alt="gallery thumbnail" className="w-full h-full object-cover rounded-xl" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-6 space-y-4 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-brand-muted mr-1 font-sans">
                  ({product.reviewsCount || 24} تقييم موثق)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-brand-muted bg-white px-2.5 py-1 rounded-lg border border-brand-border">
                {product.sku || product.productId || product.id}
              </span>
            </div>

            <div>
              <h1 className="arabic-text text-2xl sm:text-3xl font-black text-brand-text leading-snug">
                {product.nameAr}
              </h1>
              {product.nameEn && (
                <p className="text-xs font-sans font-bold text-brand-muted mt-1 tracking-wider uppercase">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-brand-text font-sans">
                {product.price.toLocaleString()} <small className="arabic-text text-sm font-bold text-brand-muted">ر.ي</small>
              </span>
              {(product.compareAtPrice || product.priceBefore) && (
                <span className="text-base text-brand-muted/70 line-through font-sans">
                  {(product.compareAtPrice || product.priceBefore).toLocaleString()} ر.ي
                </span>
              )}
            </div>

            {product.shortDescriptionAr && (
              <p className="arabic-text text-xs sm:text-sm text-brand-text/90 font-bold leading-relaxed">
                {product.shortDescriptionAr}
              </p>
            )}

            <p className="arabic-text text-xs sm:text-sm text-brand-text/80 leading-relaxed bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
              {product.descriptionAr}
            </p>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-brand-border">
                <span className="text-brand-muted block mb-0.5">الحجم / السعة:</span>
                <span className="font-bold text-brand-text">{product.size || '30 مل'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-brand-border">
                <span className="text-brand-muted block mb-0.5">حالة المخزون:</span>
                <span className={cn("font-bold", product.stock > 0 ? "text-emerald-700" : "text-red-600")}>
                  {product.stock > 0 ? `متوفر جاهز للشحن (${product.stock} قطع)` : 'نفد من المخزون مؤقتاً'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white rounded-2xl border border-brand-border p-1 shadow-2xs">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-brand-text hover:bg-brand-cream rounded-xl transition-colors font-bold text-base cursor-pointer"
                    aria-label="إنقاص الكمية"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-bold font-sans text-brand-text">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center text-brand-text hover:bg-brand-cream rounded-xl transition-colors font-bold text-base cursor-pointer"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={cn(
                    "flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold arabic-text transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer",
                    product.stock > 0
                      ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>تمت الإضافة للسلة بنجاح 🌸</span>
                    </>
                  ) : product.stock > 0 ? (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>أضف إلى السلة</span>
                    </>
                  ) : (
                    <span>غير متوفر حالياً</span>
                  )}
                </button>
              </div>

              {/* Share Product Button */}
              <button
                type="button"
                onClick={handleShareProduct}
                className={cn(
                  "w-full py-3 rounded-2xl text-xs sm:text-sm font-bold arabic-text transition-all border flex items-center justify-center gap-2 cursor-pointer shadow-2xs",
                  copiedLink
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200"
                    : "bg-white text-brand-text border-brand-border hover:bg-brand-cream hover:border-brand-blue/60"
                )}
                title="مشاركة رابط هذا المستحضر مباشرة"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>تم نسخ رابط المستحضر بنجاح! جاهز للإرسال 🔗</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-brand-blue" />
                    <span>مشاركة رابط المستحضر (نسخ الرابط المباشر)</span>
                  </>
                )}
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-brand-border text-center text-xs text-brand-text font-bold">
              <div className="p-3 bg-white rounded-2xl border border-brand-border shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-brand-blue mx-auto mb-1" />
                <span className="text-[11px] block">نقاء وأصالة 100%</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-brand-border shadow-2xs">
                <Truck className="w-4 h-4 text-brand-blue mx-auto mb-1" />
                <span className="text-[11px] block">توصيل مجاني بصنعاء</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-brand-border shadow-2xs">
                <RefreshCcw className="w-4 h-4 text-brand-blue mx-auto mb-1" />
                <span className="text-[11px] block">استرجاع خلال 3 أيام</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="flex border-b border-brand-border mb-6 overflow-x-auto justify-start sm:justify-center gap-3">
            <button 
              onClick={() => setActiveTab('info')}
              className={cn(
                "pb-2.5 px-4 arabic-text text-xs sm:text-sm font-bold transition-all relative block whitespace-nowrap cursor-pointer",
                activeTab === 'info' ? "text-brand-blue" : "text-brand-muted hover:text-brand-text"
              )}
            >
              الوصف والفوائد
              {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('ingredients')}
              className={cn(
                "pb-2.5 px-4 arabic-text text-xs sm:text-sm font-bold transition-all relative block whitespace-nowrap cursor-pointer",
                activeTab === 'ingredients' ? "text-brand-blue" : "text-brand-muted hover:text-brand-text"
              )}
            >
              المكونات النقية
              {activeTab === 'ingredients' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('usage')}
              className={cn(
                "pb-2.5 px-4 arabic-text text-xs sm:text-sm font-bold transition-all relative block whitespace-nowrap cursor-pointer",
                activeTab === 'usage' ? "text-brand-blue" : "text-brand-muted hover:text-brand-text"
              )}
            >
              طريقة الاستخدام
              {activeTab === 'usage' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "pb-2.5 px-4 arabic-text text-xs sm:text-sm font-bold transition-all relative block whitespace-nowrap cursor-pointer",
                activeTab === 'reviews' ? "text-brand-blue" : "text-brand-muted hover:text-brand-text"
              )}
            >
              تجارب العميلات ({product.reviewsCount || 24})
              {activeTab === 'reviews' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-brand-border shadow-xs text-right leading-relaxed text-brand-text">
            {activeTab === 'info' && (
              <div className="space-y-4 max-w-3xl">
                <h4 className="arabic-text font-black text-base text-brand-text">فوائد المستحضر ومميزاته:</h4>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-brand-text/80 pr-2">
                    {product.benefits.map((b: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="arabic-text text-xs sm:text-sm text-brand-muted leading-relaxed">{product.descriptionAr}</p>
                )}
                <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-border/60 text-xs text-brand-text">
                  <strong>الهدف والعناية:</strong> {product.recommendationReason || 'تم تطوير هذه التركيبة لتقديم ترطيب ونضارة متوازنة ومستدامة.'}
                </div>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="space-y-4 max-w-3xl">
                <h4 className="arabic-text font-black text-base text-brand-text">المكونات الفعالة والنقاء:</h4>
                <p className="arabic-text text-xs sm:text-sm text-brand-text bg-brand-cream/40 p-4 rounded-2xl border border-brand-border">
                  {product.ingredients || product.ingredientsAr || "تركيبة نقية مختبرة جلدياً بخلاصات نباتية وفيتامينات مغذية."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {['مكونات نقية 100%', 'خالٍ من البارابين', 'خالٍ من الكحول المضر', 'آمن للبشرة الحساسة'].map(tag => (
                    <div key={tag} className="bg-brand-cream p-2.5 rounded-xl text-center font-bold text-[11px] text-brand-text border border-brand-border">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'usage' && (
              <div className="space-y-3 max-w-3xl">
                <h4 className="arabic-text font-black text-base text-brand-text">إرشادات الاستخدام اليومي:</h4>
                <p className="arabic-text text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {product.usage || product.usageAr || "يُوضع على بشرة نظيفة ورطبة قليلاً ويدلك بلطف حتى الامتصاص التام."}
                </p>
                {product.precautionsAr && (
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>تنبيه:</strong> {product.precautionsAr}</span>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-3 max-w-3xl">
                 {[
                   { name: 'منى اليماني (صنعاء)', comment: 'سيروم رائع جداً، لاحظت إشراقة وتوحيد بلون بشرتي خلال أقل من أسبوعين. التوصيل كان سريعاً والتعامل قمة بالذوق.', stars: 5 },
                   { name: 'هدى باعباد (حضرموت)', comment: 'قوام ممتاز لا يترك أي أثر دهني ومناسب جداً للجو الحار. سعيدة جداً بوجود براند يمني بهذه الفخامة.', stars: 5 }
                 ].map((rev, i) => (
                   <div key={i} className="p-4 bg-brand-cream/40 rounded-2xl border border-brand-border space-y-1.5">
                     <div className="flex items-center justify-between">
                       <h5 className="arabic-text font-bold text-xs sm:text-sm text-brand-text">{rev.name}</h5>
                       <div className="flex text-amber-500">
                         {[...Array(rev.stars)].map((_, j) => <Star key={j} size={13} fill="currentColor" />)}
                       </div>
                     </div>
                     <p className="arabic-text text-xs text-brand-muted leading-relaxed">
                       {rev.comment}
                     </p>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
