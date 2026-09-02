import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Phone, 
  Bot, 
  ShoppingBag, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatAboutProducts } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/useSettings';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data';
import { findMatchingTrainingRule, AiTrainingRule, DEFAULT_AI_TRAINING_RULES } from '../data/aiTrainingData';
import { Product } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'روتين الحبوب والمسامات', query: 'بشرتي دهنية وتطلع فيها حبوب ومسامات واسعة، ايش الروتين المناسب؟' },
  { label: 'نضارة وتوحيد لون البشرة', query: 'عندي تصبغات وآثار حبوب وبشرتي باهتة، كيف ارجع نضارتها؟' },
  { label: 'ترميم جفاف وحاجز البشرة', query: 'بشرتي جافة جداً وتتقشر وفيها شد، ايش استخدم لترميمها؟' },
  { label: 'واقي شمس بدون أثر أبيض', query: 'ايش مميزات واقي شمس ود وهل يترك أثر أبيض؟' },
  { label: 'منتجات آمنة للحوامل', query: 'أنا حامل / مرضع، ايش المنتجات الآمنة لي في متجركم؟' },
  { label: 'التوصيل لجميع المحافظات', query: 'كم يستغرق التوصيل وكم سعره لصنعاء وباقي المحافظات؟' },
];

export const Chatbot: React.FC = () => {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Active training rules
  const activeTrainingRules: AiTrainingRule[] = 
    Array.isArray(settings.ai_training_rules) && settings.ai_training_rules.length > 0
      ? settings.ai_training_rules
      : DEFAULT_AI_TRAINING_RULES;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: 'أهلاً بكِ في «ود» للعناية بالبشرة 🌸 أنا مستشارتكِ الذكية المعتمدة. كيف يمكنني مساعدتكِ اليوم في اختيار الروتين والمستحضرات الأنسب لنوع بشرتكِ؟',
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const processQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage = queryText.trim();
    const userMsgId = `user-${Date.now()}`;
    const userTime = new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });

    setInput('');
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      text: userMessage,
      timestamp: userTime
    }]);
    setIsLoading(true);

    try {
      // 1. Check custom admin training rules first for instant accurate matching
      const matchedRule = findMatchingTrainingRule(userMessage, activeTrainingRules);

      if (matchedRule && matchedRule.isActive !== false) {
        // Find matching products
        const matchedProducts = PRODUCTS.filter(p => 
          (matchedRule.recommendedProductIds || []).includes(p.id) ||
          (matchedRule.recommendedProductIds || []).includes(p.category)
        );

        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'model',
          text: matchedRule.response,
          recommendedProducts: matchedProducts,
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoading(false);
        return;
      }

      // 2. Call server-side AI Gemini consultant with trained ground-truth
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatAboutProducts(
        userMessage,
        chatHistory,
        settings.ai_instructions,
        activeTrainingRules,
        PRODUCTS
      );

      // Extract products to recommend
      let recProducts: Product[] = [];
      if (response.recommendedProductIds && response.recommendedProductIds.length > 0) {
        recProducts = PRODUCTS.filter(p => response.recommendedProductIds?.includes(p.id));
      }

      // Fallback matching products by keyword if none explicitly returned
      if (recProducts.length === 0) {
        const lowerRes = response.text.toLowerCase();
        recProducts = PRODUCTS.filter(p => 
          lowerRes.includes(p.nameAr.slice(0, 8).toLowerCase()) ||
          (p.category && lowerRes.includes(p.category.toLowerCase()))
        ).slice(0, 3);
      }

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: response.text,
        recommendedProducts: recProducts,
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: 'عذراً، أواجه صعوبة مؤقتة في الاتصال. يمكنكِ التواصل معنا مباشرة عبر واتساب للحصول على استشارة فورية 🌸',
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    processQuery(input);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'model',
        text: 'أهلاً بكِ في «ود» للعناية بالبشرة 🌸 أنا مستشارتكِ الذكية المعتمدة. كيف يمكنني مساعدتكِ اليوم في اختيار الروتين والمستحضرات الأنسب لنوع بشرتكِ؟',
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex flex-col items-start text-right">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-[340px] sm:w-[400px] h-[540px] bg-white rounded-3xl shadow-2xl border-2 border-brand-gold/30 flex flex-col overflow-hidden text-gray-900"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#233446] via-[#7A9FB0] to-[#93B5C6] p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-white/15 rounded-2xl flex items-center justify-center border border-white/25 shadow-inner">
                    <Sparkles className="w-5 h-5 text-[#E4D8DC]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#233446] rounded-full" />
                </div>
                <div>
                  <h3 className="arabic-text font-black text-sm text-white flex items-center gap-1.5">
                    <span>مساعد «وِد» للعناية بالبشرة</span>
                  </h3>
                  <p className="text-[10px] text-[#E4D8DC] font-medium">استشارات وروتينات صيدلانية متخصصة</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  className="p-1.5 hover:bg-white/15 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
                  title="محادثة جديدة"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-xl transition-colors text-white cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-brand-bg">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={cn(
                      "max-w-[90%] p-3.5 rounded-2xl arabic-text text-xs leading-relaxed transition-all relative group",
                      msg.role === 'user' 
                        ? "bg-gradient-to-r from-[#233446] to-[#7A9FB0] text-white mr-auto rounded-tl-xs shadow-xs font-medium" 
                        : "bg-white text-brand-text border border-brand-border ml-auto rounded-tr-xs shadow-xs"
                    )}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Message Footer / Copy */}
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5 text-[9px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'model' && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:opacity-100 flex items-center gap-1 cursor-pointer transition-opacity text-brand-blue-dark"
                          title="نسخ النص"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-600">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attached Product Recommendation Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="ml-auto w-full max-w-[94%] space-y-1.5 pr-2">
                      <span className="text-[10px] font-black text-brand-text flex items-center gap-1">
                        <ShoppingBag size={12} className="text-brand-blue" />
                        <span>مستحضرات وِد المقترحة لكِ:</span>
                      </span>
                      <div className="space-y-1.5">
                        {msg.recommendedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white rounded-2xl p-2.5 border border-brand-blue/40 shadow-xs flex items-center justify-between gap-2.5 hover:border-brand-blue transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={prod.images?.[0] || prod.imageUrl}
                                alt={prod.nameAr}
                                className="w-11 h-11 rounded-xl object-cover border border-brand-border shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-bold text-brand-text truncate">{prod.nameAr}</h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-mono font-black text-brand-text">
                                    {prod.price?.toLocaleString()} ر.ي
                                  </span>
                                  {prod.compareAtPrice && (
                                    <span className="text-[10px] font-mono text-brand-text-muted line-through">
                                      {prod.compareAtPrice?.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToCart(prod)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs",
                                addedProductId === prod.id
                                  ? "bg-emerald-600 text-white"
                                  : "bg-brand-blue hover:bg-brand-blue-dark text-[#233446]"
                              )}
                            >
                              {addedProductId === prod.id ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>تمت الإضافة</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 text-[#233446]" />
                                  <span>أضف للسلة</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="bg-white text-brand-text border border-brand-border ml-auto p-3 rounded-2xl flex items-center gap-2.5 shadow-xs max-w-[80%]">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                  <span className="text-xs font-bold text-brand-text-muted">مساعد وِد يجهز استشارتكِ...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-3 py-2 bg-brand-gray-light border-t border-brand-border overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => processQuery(item.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-brand-blue-light/30 text-brand-text border border-brand-border rounded-xl text-[10px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Direct WhatsApp Consultation Banner */}
            <div className="px-3.5 py-1.5 bg-white border-t border-brand-border flex items-center justify-between">
              <span className="text-[10px] text-brand-text-muted font-bold arabic-text">تريدين التحدث مع أخصائية العناية؟</span>
              <a
                href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 arabic-text bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200"
              >
                <Phone className="w-2.5 h-2.5 text-emerald-700" />
                <span>واتساب مباشر</span>
              </a>
            </div>

            {/* Input Form */}
            <div className="p-2.5 bg-white border-t border-brand-border">
              <div className="flex gap-2 bg-brand-bg rounded-2xl p-1.5 items-center border border-brand-border focus-within:border-brand-blue transition-all">
                <input
                  type="text"
                  placeholder="اسألي عن السيرومات، الحبوب، التفتيح، واقي الشمس..."
                  className="flex-1 bg-transparent border-0 arabic-text text-xs outline-none px-2.5 text-brand-text placeholder:text-brand-text-muted font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-brand-blue hover:bg-brand-blue-dark text-[#233446] rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                  title="إرسال"
                >
                  <Send className="w-3.5 h-3.5 rotate-180 text-[#233446]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 bg-gradient-to-br from-[#233446] via-[#7A9FB0] to-[#93B5C6] text-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 group relative border-2 border-white/60 cursor-pointer"
        title="مساعد ود للعناية بالبشرة"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <X key="close" className="w-6 h-6 text-white" />
          ) : (
            <div key="open" className="relative flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#E4D8DC] group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#233446] rounded-full animate-pulse" />
            </div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
