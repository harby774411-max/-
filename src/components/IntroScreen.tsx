import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, ChevronDown } from 'lucide-react';
import { WedLogo } from './WedLogo';
import { useSettings } from '../lib/useSettings';

interface IntroScreenProps {
  onEnter: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { settings } = useSettings();
  const storeName = settings?.store_name || 'وِد';

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-[#2B151B] text-[#FAF6F0] flex flex-col justify-between items-center px-6 py-12 overflow-hidden select-none"
        >
          {/* Ambient Luxury Lighting Layers */}
          <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-[#681329]/60 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-[#C5A880]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(104,19,41,0.25)_0%,transparent_70%)] pointer-events-none" />

          {/* Top Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#DFCEB5] backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="arabic-text">العناية المخملية بالبشرة | اليمن</span>
          </motion.div>

          {/* Center Brand Showcase */}
          <div className="flex flex-col items-center text-center max-w-lg space-y-8 my-auto relative z-10">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative p-6 rounded-full bg-gradient-to-b from-white/10 to-transparent border border-[#C5A880]/30 shadow-2xl"
            >
              <div className="absolute inset-0 rounded-full bg-[#C5A880]/10 blur-xl animate-pulse" />
              <WedLogo size="lg" variant="gold" className="relative z-10 scale-125 my-2" />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-3"
            >
              <h1 className="arabic-text text-3xl sm:text-4xl font-black text-[#FAF6F0] tracking-wide">
                جمالٌ يفيض نضارةً وأنوثة
              </h1>
              <p className="arabic-text text-sm sm:text-base text-[#FAF6F0]/75 leading-relaxed font-light">
                {`مرحباً بكِ في عالم «${storeName}»؛ حيث تلتقي أحدث ابتكارات العناية الصيدلانية بأرقى المعايير الطبيعية لمنح بشرتكِ إشراقة مخملية دائمة.`}
              </p>
            </motion.div>

            {/* Enter Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="w-full pt-4"
            >
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#C5A880] via-[#DFCEB5] to-[#C5A880] text-[#2B151B] rounded-full font-black text-base shadow-xl hover:shadow-[#C5A880]/20 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto group cursor-pointer"
              >
                <span className="arabic-text">{`دخول عالم ${storeName}`}</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Bottom Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center gap-2 text-xs text-[#FAF6F0]/60 arabic-text cursor-pointer hover:opacity-100 transition-opacity"
            onClick={handleClose}
          >
            <span>انقري للمتابعة إلى المتجر</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
