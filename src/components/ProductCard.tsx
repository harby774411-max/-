import React, { useState } from 'react';
import { ShoppingCart, Eye, Check, ShoppingBag, Sparkles, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const SKIN_TYPE_NAMES: Record<string, string> = {
  all: 'جميع أنواع البشرة',
  dry: 'البشرة الجافة',
  oily: 'البشرة الدهنية',
  combination: 'البشرة المختلطة',
  sensitive: 'البشرة الحساسة',
  normal: 'البشرة العادية',
};

const GOAL_NAMES: Record<string, string> = {
  glow: 'النضارة والإشراق',
  hydration: 'الترطيب والترميم',
  barrier_repair: 'ترميم حاجز البشرة',
  cleansing: 'تنقية وتنظيف المسام',
  protection: 'الحماية اليومية SPF',
  anti_aging: 'مقاومة الإجهاد والبهتان',
  whitening: 'توحيد لون البشرة',
};

export const ProductCard: React.FC<{ product: Product; showReason?: boolean }> = ({ product }) => {
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setShowNotification(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product.id || product.productId;
    const shareUrl = `${window.location.origin}/products/${prodId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nameAr,
          text: `شاهدي ${product.nameAr} في متجر وِد للعناية بالبشرة 🌸`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2200);
    } catch (err) {
      // Fallback
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1608248597359-0a62372f8830?auto=format&fit=crop&q=80&w=800'
  ];

  const suitableFor = SKIN_TYPE_NAMES[product.skinType || 'all'] || 'جميع أنواع البشرة';
  const helpsWith = GOAL_NAMES[product.goal || 'glow'] || 'العناية والنضارة';
  const reasonText = product.recommendationReason || (product.category === 'bundles' ? 'باقة متكاملة للعناية اليومية' : 'تركيبة نقية وفعالة لتدليل بشرتك');

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border border-brand-border flex flex-col justify-between text-right h-full relative">
      {/* Product Image */}
      <div 
        className="relative aspect-square overflow-hidden bg-[#F0F3F6] cursor-pointer"
        onMouseEnter={() => images.length > 1 && setCurrentImgIndex(1)}
        onMouseLeave={() => images.length > 1 && setCurrentImgIndex(0)}
      >
        <Link to={`/products/${product.id || product.productId}`} className="block w-full h-full relative">
          <img
            src={images[currentImgIndex] || images[0]}
            alt={product.nameAr}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
          />
          
          {/* Quick-View Hover Overlay on Desktop */}
          <div className="absolute inset-0 bg-[#233446]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white text-brand-text flex items-center justify-center shadow-md border border-brand-border">
              <Eye className="w-4 h-4 text-brand-blue" />
            </div>
          </div>
        </Link>
        
        {/* Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.badge ? (
            <span className="bg-brand-blue text-white text-[10px] px-2 py-0.5 rounded-md arabic-text font-bold shadow-xs">
              {product.badge}
            </span>
          ) : (
            <span className="bg-brand-pink text-[#233446] text-[10px] px-2 py-0.5 rounded-md arabic-text font-bold shadow-xs">
              أصلي 100%
            </span>
          )}
        </div>

        {/* Share Button on Card */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brand-text flex items-center justify-center shadow-sm border border-brand-border transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="مشاركة رابط المنتج"
          aria-label="مشاركة رابط المنتج"
        >
          <Share2 className="w-3.5 h-3.5 text-brand-blue" />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between text-right space-y-2">
        <div className="space-y-1.5">
          {/* Product Title */}
          <Link to={`/products/${product.id || product.productId}`}>
            <h3 className="arabic-text text-xs sm:text-sm font-black text-brand-text group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug min-h-[2.4rem]">
              {product.nameAr}
            </h3>
          </Link>

          {/* Quick Dynamic Spec Pills */}
          <div className="space-y-1 pt-1 text-[11px] arabic-text">
            <div className="flex items-center gap-1.5 text-brand-text-muted">
              <span className="font-bold text-brand-text shrink-0 text-[10px] bg-[#F0F3F6] px-1.5 py-0.5 rounded">مناسب لـ:</span>
              <span className="truncate text-brand-text text-[11px]">{suitableFor}</span>
            </div>

            <div className="flex items-center gap-1.5 text-brand-text-muted">
              <span className="font-bold text-brand-text shrink-0 text-[10px] bg-brand-pink/50 px-1.5 py-0.5 rounded">يساعد على:</span>
              <span className="truncate text-brand-text text-[11px] font-medium">{helpsWith}</span>
            </div>
          </div>

          {/* Short reason note */}
          <p className="arabic-text text-[10px] text-brand-text-muted bg-[#F7F9FA] p-1.5 rounded-lg border border-brand-border/60 line-clamp-1 leading-normal">
            {reasonText}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-brand-border/70">
          <div className="flex flex-col text-right">
            <span className="text-sm sm:text-base font-black text-brand-text font-sans leading-none">
              {Number(product.price).toLocaleString()}
              <small className="arabic-text font-bold text-[10px] mr-1 text-brand-text-muted">ر.ي</small>
            </span>
            {product.priceBefore && (
              <span className="text-[10px] text-brand-text-muted/60 line-through font-sans mt-0.5">
                {Number(product.priceBefore).toLocaleString()} ر.ي
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark active:scale-95 transition-all shadow-xs text-xs font-bold arabic-text cursor-pointer shrink-0"
            title="أضف إلى السلة"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">أضف إلى السلة</span>
          </button>
        </div>
      </div>

      {/* Added to Cart Feedback Modal */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 left-2 right-2 z-20 bg-emerald-800 text-white py-2 px-3 rounded-xl shadow-lg text-center text-xs arabic-text font-bold flex items-center justify-center gap-1.5 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 text-emerald-300" />
            <span>تم نسخ رابط المستحضر بنجاح! 🌸</span>
          </motion.div>
        )}

        {showNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowNotification(false)}
          >
            <motion.div 
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-brand-border text-center text-brand-text"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-brand-blue/15 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-3 border border-brand-blue/30 shadow-xs">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              
              <h3 className="arabic-text text-base sm:text-lg font-black text-brand-text mb-1">تمت الإضافة للسلة بنجاح</h3>
              <p className="arabic-text text-xs text-brand-text-muted mb-5 leading-relaxed">
                «{product.nameAr}»
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-brand-blue text-white py-3 rounded-xl arabic-text font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-brand-blue-dark transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>المتابعة إلى سلة الشراء</span>
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="w-full bg-[#F0F3F6] text-brand-text py-2.5 rounded-xl arabic-text font-bold text-xs hover:bg-brand-gray-light transition-all cursor-pointer"
                >
                  متابعة التسوق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
