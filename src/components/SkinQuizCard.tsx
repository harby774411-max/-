import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, RotateCcw, X } from 'lucide-react';
import { SkinType } from '../types';
import { cn } from '../lib/utils';

interface SkinQuizCardProps {
  onApplyFilter: (skinType: SkinType, filterLabel: string) => void;
  onResetFilter: () => void;
  activeFilterSkinType?: string | null;
}

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    skinType: SkinType;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'كيف يبدو ملمس بشرتك بعد غسلها بنصف ساعة؟',
    options: [
      { label: 'مشدودة وجافة وباهتة', skinType: 'dry' },
      { label: 'لمعان في الأنف والجبهة فقط', skinType: 'combination' },
      { label: 'لمعان وإفراز دهني بكامل الوجه', skinType: 'oily' },
      { label: 'وخز، احمرار أو تحسس سريع', skinType: 'sensitive' },
    ]
  },
  {
    id: 2,
    text: 'ما الهدف الأساسي الذي ترغبين بتحقيقه؟',
    options: [
      { label: 'نضارة وتوحيد لون البشرة', skinType: 'all' },
      { label: 'ترطيب عميق وترميم الحاجز', skinType: 'dry' },
      { label: 'تنقية المسام وموازنة الزيوت', skinType: 'oily' },
      { label: 'تهدئة الاحمرار وتخفيف التحسس', skinType: 'sensitive' },
    ]
  }
];

const SKIN_TYPE_TITLES: Record<SkinType, string> = {
  dry: 'البشرة الجافة (تحتاج ترطيب وترميم)',
  oily: 'البشرة الدهنية (تحتاج تنقية وموازنة)',
  combination: 'البشرة المختلطة (تحتاج توازن ونضارة)',
  sensitive: 'البشرة الحساسة (تحتاج تركيبات مهدئة)',
  normal: 'البشرة العادية (نضارة وحماية)',
  all: 'جميع أنواع البشرة (نضارة متكاملة)',
};

export const SkinQuizCard: React.FC<SkinQuizCardProps> = ({
  onApplyFilter,
  onResetFilter,
  activeFilterSkinType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, SkinType>>({});
  const [resultType, setResultType] = useState<SkinType | null>(null);

  const handleSelectOption = (qId: number, skinType: SkinType) => {
    const nextAnswers = { ...answers, [qId]: skinType };
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const selected = skinType;
      setResultType(selected);
      onApplyFilter(selected, SKIN_TYPE_TITLES[selected] || 'بشرتك');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResultType(null);
    setCurrentStep(1);
    onResetFilter();
  };

  const currentQ = QUESTIONS.find(q => q.id === currentStep);

  return (
    <div className="w-full bg-white rounded-2xl border border-brand-border p-3 sm:p-4 text-right shadow-2xs">
      {/* Compact Header / Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="arabic-text font-black text-xs sm:text-sm text-brand-text">
                اختبار تحديد نوع البشرة السريع
              </span>
              <span className="text-[10px] bg-brand-pink text-[#233446] px-2 py-0.5 rounded-full font-bold">
                دقيقة واحدة
              </span>
            </div>
            <p className="arabic-text text-[11px] text-brand-text-muted mt-0.5 hidden sm:block">
              أجيبي على سؤالين لمعرفة ما يناسبكِ وعرض المنتجات الملائمة فوراً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterSkinType && (
            <button
              onClick={handleReset}
              className="text-[11px] text-brand-blue hover:text-brand-blue-dark font-bold flex items-center gap-1 bg-brand-blue/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إلغاء التصفية</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen && resultType) handleReset();
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 cursor-pointer border",
              isOpen
                ? "bg-[#F0F3F6] text-brand-text border-brand-border"
                : "bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-dark shadow-2xs"
            )}
          >
            {isOpen ? 'إغلاق' : resultType ? 'إعادة الاختبار' : 'بدء الاختبار'}
          </button>
        </div>
      </div>

      {/* Active Filter Banner when closed */}
      {activeFilterSkinType && !isOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-brand-border/60 flex items-center justify-between text-xs">
          <span className="text-brand-text-muted text-[11px]">
            عرض المنتجات المناسبة لـ: <strong className="text-brand-text">{SKIN_TYPE_TITLES[activeFilterSkinType as SkinType] || activeFilterSkinType}</strong>
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] text-brand-blue underline cursor-pointer"
          >
            عرض كل المنتجات
          </button>
        </div>
      )}

      {/* Inline Quiz Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-brand-border overflow-hidden"
          >
            {!resultType && currentQ ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-brand-text-muted font-bold">
                  <span>{currentQ.text}</span>
                  <span className="text-[10px] bg-[#F0F3F6] px-2 py-0.5 rounded text-brand-text font-mono">
                    {currentStep} / {QUESTIONS.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, opt.skinType)}
                      className="p-2.5 bg-[#F7F9FA] hover:bg-brand-blue hover:text-white rounded-xl border border-brand-border text-center text-xs font-bold text-brand-text transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className="group-hover:text-white">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : resultType ? (
              <div className="p-3 bg-[#F0F3F6] rounded-xl border border-brand-border flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="text-brand-text-muted">الترشيح الأنسب لبشرتك: </span>
                  <strong className="text-brand-blue font-black">{SKIN_TYPE_TITLES[resultType]}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue-dark cursor-pointer"
                  >
                    تصفح المنتجات المرشحة
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1 text-brand-text-muted hover:text-brand-text cursor-pointer"
                    title="إلغاء"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
