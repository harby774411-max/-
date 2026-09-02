/* BEGIN WID WELCOME INTRO */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WidWelcomeIntroProps {
  onComplete?: () => void;
}

export const WidWelcomeIntro: React.FC<WidWelcomeIntroProps> = ({ onComplete }) => {
  // Only play intro on first visit of session
  const [active, setActive] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('wid_intro_seen');
    } catch {
      return true;
    }
  });

  // Stage timeline index (0 to 8)
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    if (!active) return;

    const timers: NodeJS.Timeout[] = [];

    // Stage 0: 00.00s - 00.80s -> «نختار لك»
    // Stage 1: 00.80s - 01.45s -> Pop-in of 4 words sequentially near center
    timers.push(setTimeout(() => setStage(1), 800));

    // Stage 2: 01.45s - 02.25s -> Disperse/Fly to corners (top-right, top-left, bottom, side)
    timers.push(setTimeout(() => setStage(2), 1450));

    // Stage 3: 02.25s - 02.90s -> Hold in dispersed positions
    timers.push(setTimeout(() => setStage(3), 2250));

    // Stage 4: 02.90s - 03.85s -> Magnetic return to center (staggered)
    timers.push(setTimeout(() => setStage(4), 2900));

    // Stage 5: 03.85s - 04.45s -> «وعشان كذا»
    timers.push(setTimeout(() => setStage(5), 3850));

    // Stage 6: 04.45s - 05.00s -> «جاتك»
    timers.push(setTimeout(() => setStage(6), 4450));

    // Stage 7: 05.00s - 05.70s -> «وِد» (with kasra)
    timers.push(setTimeout(() => setStage(7), 5000));

    // Stage 8: 05.70s - 06.75s -> Morph «وِد» to horizontal line, then window frame
    timers.push(setTimeout(() => setStage(8), 5700));

    // Stage 9: 06.75s - 07.80s -> Window expands to full screen & dissolves into store
    timers.push(setTimeout(() => setStage(9), 6750));

    // Finish & unmount at ~07.80s
    timers.push(setTimeout(() => {
      setActive(false);
      try {
        sessionStorage.setItem('wid_intro_seen', 'true');
      } catch (e) {}
      if (onComplete) onComplete();
    }, 7800));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="wid-motion-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 9 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: stage === 9 ? 0.65 : 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-[999999] bg-[#FAF8F5] text-[#1E293B] flex items-center justify-center overflow-hidden select-none"
        dir="rtl"
        style={{ pointerEvents: stage === 9 ? 'none' : 'auto' }}
      >
        {/* Subtle Brand Atmosphere using official brand palette */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/3 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#93B5C6]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#E4D8DC]/30 rounded-full blur-[100px]" />
        </div>

        {/* Central Kinetic Typography Stage */}
        <div className="relative w-full max-w-4xl h-[420px] sm:h-[500px] flex items-center justify-center">

          {/* ============================================================
              PHASE 1 to 4 (00.00s - 03.85s):
              Anchor «نختار لك» + 4 Pure Dynamic Typography Words (No Boxes/Borders)
             ============================================================ */}
          {stage <= 4 && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Central Anchor Text: «نختار لك» in Official Brand Dark Blue/Navy */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: stage >= 4 ? 0 : 1,
                  scale: stage >= 4 ? 0.85 : 1,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 text-3xl sm:text-5xl md:text-6xl font-black text-[#233446] tracking-tight font-sans"
              >
                نختار لك
              </motion.div>

              {/* 1. «منتجات أصلية» (Official Brand Blue: #93B5C6) */}
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 30 }}
                  animate={
                    stage === 1
                      ? { opacity: 1, scale: 1, x: 80, y: -50, rotate: 0 }
                      : stage === 2 || stage === 3
                      ? { opacity: 1, scale: 1, x: 'clamp(90px, 26vw, 240px)', y: 'clamp(-130px, -20vh, -160px)', rotate: 3 }
                      : { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 } // Magnetic return to center
                  }
                  transition={{
                    duration: stage === 1 ? 0.25 : stage === 2 ? 0.6 : 0.4,
                    ease: stage === 2 ? [0.22, 1, 0.36, 1] : [0.34, 1.56, 0.64, 1],
                  }}
                  className="absolute z-20 text-[#7A9FB0] font-black text-lg sm:text-2xl md:text-3xl tracking-tight whitespace-nowrap"
                >
                  منتجات أصلية
                </motion.div>
              )}

              {/* 2. «تناسب عنايتك» (Official Brand Dark Slate Blue: #233446) */}
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 30 }}
                  animate={
                    stage === 1
                      ? { opacity: 1, scale: 1, x: -80, y: -50, rotate: 0 }
                      : stage === 2 || stage === 3
                      ? { opacity: 1, scale: 1, x: 'clamp(-240px, -26vw, -90px)', y: 'clamp(-130px, -20vh, -160px)', rotate: -3 }
                      : { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 } // Magnetic return to center
                  }
                  transition={{
                    duration: stage === 1 ? 0.25 : stage === 2 ? 0.6 : 0.42,
                    delay: stage === 1 ? 0.12 : stage === 4 ? 0.05 : 0,
                    ease: stage === 2 ? [0.22, 1, 0.36, 1] : [0.34, 1.56, 0.64, 1],
                  }}
                  className="absolute z-20 text-[#233446] font-black text-lg sm:text-2xl md:text-3xl tracking-tight whitespace-nowrap"
                >
                  تناسب عنايتك
                </motion.div>
              )}

              {/* 3. «لأنك» (Official Brand Rose/Pink: #B4CAD6 / #E4D8DC) */}
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 20 }}
                  animate={
                    stage === 1
                      ? { opacity: 1, scale: 1, x: -60, y: 55, rotate: -2 }
                      : stage === 2 || stage === 3
                      ? { opacity: 1, scale: 1.05, x: 0, y: 'clamp(95px, 18vh, 150px)', rotate: -2 }
                      : { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 } // Magnetic return to center
                  }
                  transition={{
                    duration: stage === 1 ? 0.25 : stage === 2 ? 0.55 : 0.45,
                    delay: stage === 1 ? 0.22 : stage === 4 ? 0.1 : 0,
                    ease: stage === 2 ? [0.22, 1, 0.36, 1] : [0.34, 1.56, 0.64, 1],
                  }}
                  className="absolute z-20 text-[#7A9FB0] font-black text-xl sm:text-3xl md:text-4xl tracking-tight whitespace-nowrap"
                >
                  لأنك
                </motion.div>
              )}

              {/* 4. «مش أي حد» (Official Brand Accent Blue: #93B5C6) */}
              {stage >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 20 }}
                  animate={
                    stage === 1
                      ? { opacity: 1, scale: 1, x: 60, y: 55, rotate: 2 }
                      : stage === 2 || stage === 3
                      ? { opacity: 1, scale: 1.15, x: 'clamp(80px, 22vw, 210px)', y: 'clamp(50px, 12vh, 90px)', rotate: 4 }
                      : { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 } // Magnetic return to center
                  }
                  transition={{
                    duration: stage === 1 ? 0.28 : stage === 2 ? 0.6 : 0.48,
                    delay: stage === 1 ? 0.32 : stage === 4 ? 0.15 : 0,
                    ease: stage === 2 ? [0.22, 1, 0.36, 1] : [0.34, 1.56, 0.64, 1],
                  }}
                  className="absolute z-20 text-[#233446] font-black text-xl sm:text-3xl md:text-4xl tracking-tight whitespace-nowrap"
                >
                  مش أي حد
                </motion.div>
              )}
            </div>
          )}

          {/* ============================================================
              PHASE 5 to 7 (03.85s - 05.70s):
              Group 2: «وعشان كذا» → «جاتك» → «وِد» (Official Brand Blue Palette)
             ============================================================ */}

          {/* 1. «وعشان كذا» (03.85s - 04.45s) */}
          {stage === 5 && (
            <motion.div
              key="phrase-waashan"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1.05, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl font-black text-[#233446] tracking-tight"
            >
              وعشان كذا
            </motion.div>
          )}

          {/* 2. «جاتك» (04.45s - 05.00s) */}
          {stage === 6 && (
            <motion.div
              key="phrase-jatek"
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1.15, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-black text-[#7A9FB0] tracking-tight"
            >
              جاتك
            </motion.div>
          )}

          {/* 3. «وِد» (05.00s - 05.70s) */}
          {stage === 7 && (
            <motion.div
              key="phrase-wid"
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1.25, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-7xl sm:text-9xl font-black font-serif text-[#233446] tracking-tight"
            >
              «وِد»
            </motion.div>
          )}

          {/* ============================================================
              PHASE 8 & 9 (05.70s - 07.80s):
              Morph «وِد» → Thin Horizontal Line → Clean Minimal Window Frame → Full Expansion
             ============================================================ */}
          {stage >= 8 && (
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Thin Line expanding vertically into Minimal Window Frame */}
              <motion.div
                initial={{
                  width: '60px',
                  height: '2px',
                  opacity: 1,
                  borderRadius: '2px',
                }}
                animate={
                  stage === 8
                    ? {
                        width: ['60px', '260px', '320px'],
                        height: ['2px', '3px', '190px'],
                        opacity: [1, 1, 1],
                        borderRadius: ['2px', '4px', '20px'],
                      }
                    : {
                        width: '100vw',
                        height: '100vh',
                        borderRadius: '0px',
                        opacity: 0,
                      }
                }
                transition={{
                  duration: stage === 8 ? 0.95 : 0.8,
                  times: stage === 8 ? [0, 0.35, 1] : undefined,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-white border border-[#C9CCD5] shadow-xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 relative"
              >
                {/* Window Top Controls (Official Brand Slate / Blue Dots) */}
                <div className="flex items-center justify-between border-b border-brand-border-light pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#233446]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A9FB0]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#93B5C6]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-sans tracking-wide">
                    wed-skincare.ye
                  </span>
                </div>

                {/* Window Interior Content Preview */}
                <div className="flex-1 flex flex-col items-center justify-center py-2 space-y-1.5 text-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0284C7] text-white flex items-center justify-center font-serif font-black text-sm shadow-xs">
                    وِ
                  </div>
                  <h3 className="text-sm font-black text-[#1E3A8A]">
                    متجر «وِد» للعناية
                  </h3>
                  <div className="w-24 h-1.5 rounded-full bg-slate-100" />
                </div>

                {/* Window Bottom Subtle Line */}
                <div className="w-full flex justify-center pt-1">
                  <div className="w-16 h-1 rounded-full bg-slate-200" />
                </div>
              </motion.div>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
/* END WID WELCOME INTRO */
