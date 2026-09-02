import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  Save, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  Bot, 
  X, 
  ChevronDown, 
  CheckCircle2, 
  Layers, 
  Package, 
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';
import { AiTrainingRule, DEFAULT_AI_TRAINING_RULES, findMatchingTrainingRule } from '../data/aiTrainingData';
import { useSettings } from '../lib/useSettings';
import { PRODUCTS } from '../data';
import { cn } from '../lib/utils';
import { chatAboutProducts } from '../services/geminiService';

interface AiTrainingManagerProps {
  onSaveSuccess?: () => void;
}

export const AiTrainingManager: React.FC<AiTrainingManagerProps> = ({ onSaveSuccess }) => {
  const { settings, updateSettings } = useSettings();
  
  // Custom or default training rules
  const rules: AiTrainingRule[] = Array.isArray(settings.ai_training_rules) && settings.ai_training_rules.length > 0
    ? settings.ai_training_rules
    : DEFAULT_AI_TRAINING_RULES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<AiTrainingRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<Partial<AiTrainingRule>>({
    title: '',
    keywords: '',
    questionExample: '',
    response: '',
    recommendedProductIds: [],
    category: 'skin_concerns',
    isActive: true
  });

  // Interactive Live Testing Playground
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{
    matchedRule: AiTrainingRule | null;
    response: string;
    products: any[];
    isAiGenerated?: boolean;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // General Instructions state
  const [aiInstructions, setAiInstructions] = useState(settings.ai_instructions || '');

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      rule.title.toLowerCase().includes(q) || 
      rule.keywords.toLowerCase().includes(q) || 
      rule.questionExample.toLowerCase().includes(q) || 
      rule.response.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      id: `rule-${Date.now()}`,
      title: '',
      keywords: '',
      questionExample: '',
      response: '',
      recommendedProductIds: [],
      category: 'skin_concerns',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: AiTrainingRule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.keywords || !formData.response) {
      alert('يرجى ملء عنوان القاعدة، الكلمات المفتاحية، ونص الإجابة.');
      return;
    }

    setIsSaving(true);
    try {
      let updatedRules = [...rules];

      if (editingRule) {
        // Edit existing
        updatedRules = updatedRules.map(r => r.id === editingRule.id ? { ...r, ...formData } as AiTrainingRule : r);
      } else {
        // Add new
        const newRule: AiTrainingRule = {
          id: formData.id || `rule-${Date.now()}`,
          title: formData.title || '',
          keywords: formData.keywords || '',
          questionExample: formData.questionExample || '',
          response: formData.response || '',
          recommendedProductIds: formData.recommendedProductIds || [],
          category: formData.category as any || 'skin_concerns',
          isActive: formData.isActive !== false,
          order: rules.length + 1
        };
        updatedRules = [newRule, ...updatedRules];
      }

      await updateSettings({ ai_training_rules: updatedRules });
      setIsModalOpen(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
      onSaveSuccess?.();
    } catch (err) {
      console.error('Error saving rule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('هل أنتِ متأكدة من رغبتك في حذف قاعدة التدريب هذه؟')) return;
    try {
      const updatedRules = rules.filter(r => r.id !== ruleId);
      await updateSettings({ ai_training_rules: updatedRules });
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleToggleRuleActive = async (ruleId: string, currentStatus: boolean) => {
    try {
      const updatedRules = rules.map(r => r.id === ruleId ? { ...r, isActive: !currentStatus } : r);
      await updateSettings({ ai_training_rules: updatedRules });
    } catch (err) {
      console.error('Error toggling rule status:', err);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('هل ترغبين باستعادة قواعد التدريب الصيدلانية الافتراضية المعتمدة لمتجر وِد؟')) return;
    try {
      await updateSettings({ ai_training_rules: DEFAULT_AI_TRAINING_RULES });
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error resetting rules:', err);
    }
  };

  const handleSaveGeneralInstructions = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ ai_instructions: aiInstructions });
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error saving general instructions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Test Assistant in real-time
  const handleRunLiveTest = async () => {
    if (!testQuery.trim() || isTesting) return;
    setIsTesting(true);
    try {
      // 1. Check matching rule first
      const matched = findMatchingTrainingRule(testQuery, rules);
      if (matched) {
        // Find matching product objects
        const matchedProducts = PRODUCTS.filter(p => 
          (matched.recommendedProductIds || []).includes(p.id) ||
          (matched.recommendedProductIds || []).includes(p.category)
        );

        setTestResult({
          matchedRule: matched,
          response: matched.response,
          products: matchedProducts,
          isAiGenerated: false
        });
      } else {
        // Fallback to Gemini / server chat with training rules
        const res = await chatAboutProducts(
          testQuery,
          [],
          aiInstructions,
          rules,
          PRODUCTS
        );

        const matchedProducts = PRODUCTS.filter(p => 
          (res.recommendedProductIds || []).includes(p.id) ||
          testQuery.includes(p.nameAr.slice(0, 6))
        );

        setTestResult({
          matchedRule: null,
          response: res.text,
          products: matchedProducts,
          isAiGenerated: true
        });
      }
    } catch (err) {
      console.error('Test query error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const toggleProductInForm = (prodId: string) => {
    const current = formData.recommendedProductIds || [];
    if (current.includes(prodId)) {
      setFormData({
        ...formData,
        recommendedProductIds: current.filter(id => id !== prodId)
      });
    } else {
      setFormData({
        ...formData,
        recommendedProductIds: [...current, prodId]
      });
    }
  };

  return (
    <div className="space-y-8 text-right">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-br from-[#FAF6F0] via-white to-[#F3ECE0] rounded-3xl p-6 sm:p-8 border-2 border-brand-gold/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#722F37] text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="arabic-text text-xl font-black text-[#722F37] flex items-center gap-2">
                <span>تدريب وتوجيه مساعد «وِد» للعناية بالبشرة</span>
                <span className="text-[10px] bg-amber-100 text-[#722F37] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                  Knowledge Base AI
                </span>
              </h3>
              <p className="text-xs text-brand-text-muted mt-1">
                علّمي المساعد كيف يجيب على استفسارات العميلات (إذا سألت عن حبوب، تجاعيد، تفتيح، جفاف، أو شحن) مع ربط المنتجات للشراء الفوري.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenAddModal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#722F37] hover:bg-[#58242A] text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus size={16} className="text-amber-300" />
              <span>إضافة سيناريو / قاعدة تدريب</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="استعادة القواعد الصيدلانية الافتراضية"
            >
              <RefreshCw size={14} className="text-[#722F37]" />
              <span className="hidden md:inline">استعادة الافتراضي</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>تم حفظ وتحديث قواعد تدريب مساعد وِد بنجاح! يتم تطبيقها فوراً في المتجر.</span>
          </div>
        )}
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <h4 className="arabic-text font-black text-base text-[#722F37]">
              مختبر تجربة المساعد واختبار الردود (Live Testing)
            </h4>
          </div>
          <span className="text-[11px] text-brand-text-muted">جربي كتابة أي سؤال للتأكد من دقة الإجابة والمنتجات المرتبطة</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunLiveTest()}
            placeholder="اكتبي سؤالاً تجريبياً (مثال: بشرتي دهنية وفيها حبوب، ايش تنصحني؟)..."
            className="flex-1 p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold text-gray-900 outline-none focus:border-[#722F37]"
          />
          <button
            onClick={handleRunLiveTest}
            disabled={!testQuery.trim() || isTesting}
            className="px-5 py-3 bg-[#722F37] text-white rounded-xl text-xs font-black hover:bg-[#58242A] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Send className="w-4 h-4 rotate-180 text-amber-300" />}
            <span>اختبار الرد</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#722F37]">نتيجة استجابة المساعد:</span>
                {testResult.matchedRule ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    قاعدة تدريب مخصصة مطابقة: {testResult.matchedRule.title}
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2.5 py-0.5 rounded-full border border-blue-300">
                    استنتاج الذكاء الاصطناعي العام (AI)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-brand-border text-xs leading-relaxed text-gray-900 whitespace-pre-line font-medium">
              {testResult.response}
            </div>

            {testResult.products.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-[#722F37] block">
                  المنتجات المقترحة التي ستظهر للعميلة في الشات ({testResult.products.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {testResult.products.map(p => (
                    <div key={p.id} className="p-2.5 bg-white rounded-xl border border-brand-border flex items-center gap-2.5">
                      <img src={p.images?.[0] || p.imageUrl} alt={p.nameAr} className="w-10 h-10 rounded-lg object-cover border border-brand-border" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.nameAr}</p>
                        <span className="text-[11px] font-mono font-black text-[#722F37]">{p.price?.toLocaleString()} ر.ي</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules List & Category Filters */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <h4 className="arabic-text text-lg font-black text-[#722F37] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#722F37]" />
              <span>قائمة سيناريوهات وقواعد التدريب ({rules.length})</span>
            </h4>
            <p className="text-xs text-brand-text-muted">
              الأسئلة والكلمات الدلالية التي يتعرف عليها المساعد فوراً ليقدم الإجابة المعتمدة
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="بحث في القواعد والكلمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'كل القواعد' },
            { id: 'skin_concerns', label: 'مشاكل البشرة (حبوب، تصبغات، جفاف)' },
            { id: 'routines', label: 'الروتينات والعناية' },
            { id: 'products', label: 'المنتجات والباقات' },
            { id: 'safety_pregnancy', label: 'الحمل والأمان' },
            { id: 'shipping_payment', label: 'التوصيل والدفع' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                selectedCategory === cat.id
                  ? "bg-[#722F37] text-white border-[#722F37] shadow-xs"
                  : "bg-[#FAF6F0] text-gray-700 border-brand-border hover:bg-[#F3ECE0]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rules Cards List */}
        <div className="space-y-3.5">
          {filteredRules.length === 0 ? (
            <div className="text-center py-10 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-2">
              <Bot className="w-8 h-8 text-brand-burgundy/40 mx-auto" />
              <p className="text-xs font-bold text-gray-700">لا توجد قواعد تدريب مطابقة للبحث أو التصنيف</p>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const ruleKeywords = (rule.keywords || '').split(/[,،\n]+/).map(k => k.trim()).filter(Boolean);
              const linkedProducts = PRODUCTS.filter(p => (rule.recommendedProductIds || []).includes(p.id));

              return (
                <div
                  key={rule.id}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border transition-all text-right space-y-3",
                    rule.isActive !== false
                      ? "bg-[#FAF6F0]/70 hover:bg-white border-brand-border shadow-xs"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-brand-border/60">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        rule.isActive !== false ? "bg-emerald-500" : "bg-gray-400"
                      )} />
                      <h5 className="arabic-text font-black text-sm text-[#722F37]">
                        {rule.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleRuleActive(rule.id, rule.isActive !== false)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer",
                          rule.isActive !== false
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        )}
                      >
                        {rule.isActive !== false ? 'مفعلة' : 'معطلة'}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 bg-white text-[#722F37] hover:bg-brand-blush-light rounded-lg border border-brand-border transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Example */}
                  {rule.questionExample && (
                    <div className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-brand-border flex items-start gap-2">
                      <HelpCircle size={14} className="text-brand-gold shrink-0 mt-0.5" />
                      <span><strong>سؤال الزبونة المتوقع:</strong> "{rule.questionExample}"</span>
                    </div>
                  )}

                  {/* Keywords Tags */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-gray-600 font-bold">الكلمات المفتاحية:</span>
                    {ruleKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-brand-border text-[#722F37] rounded-md text-[10px] font-bold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Response Text */}
                  <div className="text-xs text-gray-800 bg-white/80 p-3 rounded-xl border border-brand-border/60 leading-relaxed whitespace-pre-line font-medium">
                    <span className="font-bold text-[#722F37] block mb-1">الرد المعتمد الصادر للعميلة:</span>
                    {rule.response}
                  </div>

                  {/* Linked Products */}
                  {linkedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center pt-1">
                      <span className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                        <Package size={12} className="text-brand-gold" />
                        <span>منتجات مرتبطة:</span>
                      </span>
                      {linkedProducts.map(p => (
                        <span key={p.id} className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-bold">
                          {p.nameAr} ({p.price?.toLocaleString()} ر.ي)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* General Instructions & AI Persona Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-4 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-[#722F37]" />
            <div>
              <h4 className="arabic-text font-black text-base text-[#722F37]">
                التوجيهات والشخصية العامة للمساعد الذكي (System Prompt)
              </h4>
              <p className="text-xs text-brand-text-muted">
                توجيهات عامة تتحكم في أسلوب الحوار، الترحيب، ونبرة الصوت باللغة العربية الفصحى الدافئة.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveGeneralInstructions}
            disabled={isSaving}
            className="px-4 py-2 bg-[#722F37] text-white rounded-xl text-xs font-black hover:bg-[#58242A] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} className="text-amber-300" />
            <span>حفظ التوجيهات</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          className="w-full p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border text-xs leading-relaxed font-bold text-gray-900 outline-none focus:border-[#722F37]"
          placeholder="اكتبي التوجيهات العامة للمساعد الذكي..."
        />
      </div>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-brand-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-[#722F37] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-amber-300" />
                <h4 className="arabic-text font-black text-base text-white">
                  {editingRule ? 'تعديل سيناريو تدريب المساعد' : 'إضافة سيناريو تدريب جديد للمساعد'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900">
                  عنوان السيناريو / الموضوع *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: روتين حبوب الوجه والمسامات للبشرة الدهنية"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900">
                    تصنيف الموضوع *
                  </label>
                  <select
                    value={formData.category || 'skin_concerns'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="skin_concerns">مشاكل البشرة (حبوب، تصبغات، جفاف)</option>
                    <option value="routines">الروتينات اليومية والخطوات</option>
                    <option value="products">المنتجات والباقات التوفيرية</option>
                    <option value="safety_pregnancy">الحمل والأمان والاستخدام</option>
                    <option value="shipping_payment">التوصيل والشحن والدفع</option>
                    <option value="general">استفسارات عامة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900">
                    سؤال توضيحي من الزبونة (مثال)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: بشرتي تطلع فيها حبوب ايش أستخدم؟"
                    value={formData.questionExample || ''}
                    onChange={(e) => setFormData({ ...formData, questionExample: e.target.value })}
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none focus:border-[#722F37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                  <span>الكلمات المفتاحية والعبارات الدالة (Keywords) *</span>
                  <span className="text-[10px] text-amber-700 font-bold">افصلي بين الكلمات بفاصلة (،)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حبوب، بثور، دهون، مسامات، زيتية، رؤوس سوداء"
                  value={formData.keywords || ''}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none focus:border-[#722F37]"
                />
                <p className="text-[10px] text-gray-500">إذا تضمنت رسالة العميلة أي من هذه الكلمات، سيعرض المساعد هذا الرد فوراً.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900">
                  نص الإجابة والرد المعتمد الصادر للعميلة *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="اكتبي نصيحة صيدلانية واضحة، خطوات الروتين، والمستحضرات الموصى بها..."
                  value={formData.response || ''}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs leading-relaxed font-bold outline-none focus:border-[#722F37]"
                />
              </div>

              {/* Product Attachment Selector */}
              <div className="space-y-2 pt-2 border-t border-brand-border">
                <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                  <span>المنتجات المقترحة للربط (ستظهر كبطاقات شراء فورية في الشات):</span>
                  <span className="text-[10px] text-brand-gold font-bold">اختياري</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#FAF6F0] rounded-xl border border-brand-border">
                  {PRODUCTS.map(prod => {
                    const isSelected = (formData.recommendedProductIds || []).includes(prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleProductInForm(prod.id)}
                        className={cn(
                          "p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all",
                          isSelected
                            ? "bg-[#722F37] text-white border-[#722F37]"
                            : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-[#722F37]"
                        />
                        <span className="text-[11px] font-bold truncate flex-1">{prod.nameAr}</span>
                        <span className="text-[10px] font-mono opacity-80">{prod.price?.toLocaleString()} ر.ي</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#722F37] hover:bg-[#58242A] text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Check size={16} className="text-amber-300" />}
                  <span>{editingRule ? 'حفظ التعديلات' : 'إضافة السيناريو الآن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
