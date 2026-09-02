import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import { DEFAULT_AI_TRAINING_RULES, AiTrainingRule } from '../data/aiTrainingData';

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface StoreSettings {
  store_name: string;
  store_slogan: string;
  whatsapp: string;
  whatsapp_orders: string;
  whatsapp_courier: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok?: string;
  snapchat?: string;
  telegram?: string;
  custom_links?: CustomLink[];
  whatsapp_bot_enabled?: boolean;
  whatsapp_admin_alerts_enabled?: boolean;
  whatsapp_customer_confirmation_enabled?: boolean;
  whatsapp_ai_order_prompt_template?: string;
  ai_inventory_analysis?: string;
  ai_training_rules?: AiTrainingRule[];
  logo_url: string;
  top_icon_url: string;
  middle_icon_url: string;
  bg_url: string;
  article_text: string;
  express_delivery_fee: number;
  free_shipping_threshold: number;
  ai_instructions: string;
  customer_review_template: string;
  admin_order_template: string;
  delivery_order_template: string;
  birthday_greeting_template: string;
  birthday_card_quote: string;
  stock_alert_template: string;
  verification_template: string;
  kuraimi_account: string;
  floosak_account: string;
  onecash_account: string;
  jeeb_account?: string;
  bank_transfer_name?: string;
  bank_transfer_account?: string;
  category_images?: Record<string, string>;
  [key: string]: any;
}

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<{ success: boolean; error?: any }>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'ود',
  store_slogan: 'للعناية بالبشرة',
  whatsapp: '+967770000000',
  whatsapp_orders: '+967770000000',
  whatsapp_courier: '+967771111111',
  email: 'care@wad-beauty.com',
  instagram: 'https://instagram.com/wad_skincare',
  facebook: 'https://facebook.com/wad_skincare',
  tiktok: 'https://tiktok.com/@wad_skincare',
  snapchat: 'https://snapchat.com/add/wad_skincare',
  telegram: 'https://t.me/wad_skincare',
  custom_links: [
    { id: '1', title: 'موقع المعرض في صنعاء', url: 'https://maps.google.com' },
    { id: '2', title: 'تقييمات وتجارب العميلات', url: 'https://instagram.com/wad_skincare' }
  ],
  whatsapp_bot_enabled: true,
  whatsapp_admin_alerts_enabled: true,
  whatsapp_customer_confirmation_enabled: true,
  ai_training_rules: DEFAULT_AI_TRAINING_RULES,
  logo_url: '',
  top_icon_url: '',
  middle_icon_url: '',
  bg_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070',
  article_text: 'مجموعات عناية منتقاة بعناية فائقة لتمنح بشرتك لمسة حريرية ونضارة تدوم.',
  express_delivery_fee: 1500,
  free_shipping_threshold: 30000,
  ai_instructions: `أنت «مساعد ود للعناية بالبشرة» (Wad Skincare Advisor)، المستشار المساعد لـ «ود» للعناية بالبشرة في اليمن.

طبيعة دورك وشخصيتك:
- أسلوب راقٍ، مهذب، دافئ، واحترافي باللغة العربية الفصحى.
- تستمع لنوع البشرة (جافة، دهنية، مختلطة، حساسة، عادية)، والهدف (نضارة، ترطيب، تفتيح، ترميم، حماية)، وتفضيلات العميل.

إرشادات السلامة والمهام:
1. اقتراح روتينات العناية المناسبة والمنتجات المتوفرة في كتالوج «ود» مع شرح الفوائد وطريقة الاستخدام الصحيحة.
2. التنبيه دائماً بلباقة على إجراء اختبار حساسية موضعي (Patch Test) قبل الاستخدام الأول لأي مستحضر جديد.
3. التأكيد على أن التوصيل داخل صنعاء مجاني مع توفر التوصيل السريع والشحن لمختلف المحافظات.
4. إخلاء مسؤولية طبي: تقديم نصائح تجميلية واقتراحات عناية عامة فقط، وتجنب تقديم أي تشخيصات طبية أو ادعاءات علاجية للأمراض الجلدية الحادة، والتوصية بمراجعة الطبيب المختص عند الحاجة.
5. تقديم إجابات واضحة ومباشرة ومفيدة دون إطالة غير مبررة.`,
  customer_review_template: `مرحباً بكِ في «ود» 🌸
نشكركِ على اختيارك لمنتجاتنا! لقد استلمنا طلبك برقم: {{orderNumber}}
المجموع: {{total}} ر.ي
فريق ود يجهز طلبك الآن بكل عناية واهتمام ✨`,
  admin_order_template: `📦 طلب جديد في «ود»!
رقم الطلب: {{orderNumber}}
العميل: {{customerName}}
الجوال: {{phone}}
المدينة: {{governorate}} - {{area}}
العنوان: {{address}}
نوع التوصيل: {{deliveryType}}
تاريخ التوصيل المختار: {{deliveryDate}}
المنتجات:
{{items}}
المجموع الإجمالي: {{total}} ر.ي
طريقة الدفع: {{payment}}`,
  delivery_order_template: `🚗 مهمة توصيل جديدة - «ود»
رقم الطلب: {{orderNumber}}
العميل: {{customerName}}
رقم الجوال: {{phone}}
الموقع: {{governorate}} - {{area}} - {{address}}
ملاحظات التوصيل: {{notes}}
الموعد المحدد: {{deliveryDate}} ({{deliveryType}})
المبلغ المطلوب تحصيله: {{total}} ر.ي`,
  birthday_greeting_template: `كل عام وأنتِ تزدادين بهاءً وتألقاً 🌸✨
أسرة «ود» للعناية بالبشرة تهنئكِ بمناسبة يوم ميلادك السعيد، ويسعدنا أن نقدم لكِ هذه الهدية الخاصة وبطاقة المعايدة كعربون محبة وتقدير. نتمنى لكِ عاماً مفعماً بالنضارة والسرور!`,
  birthday_card_quote: `إلى من تُزهر الأيام بحضورها.. كل عام وأنتِ سر الجمال والرقة. مع خالص الود، فريق «ود».`,
  stock_alert_template: `مرحباً {{customerName}} 🌸
يسرنا إبلاغك بتوفر منتجك المفضل «{{productName}}» مجدداً في «ود». يمكنك طلبه الآن قبل نفاد الكمية!`,
  verification_template: 'رمز التحقق الخاص بكِ لـ «ود» هو: {{code}}',
  kuraimi_account: 'الكريمي: 123456789 (باسم: ود)',
  floosak_account: 'فلوسك: 770000000',
  onecash_account: 'ون كاش: 770000000',
  jeeb_account: 'جيب: 770000000',
  bank_transfer_name: 'مؤسسة وِد للعناية والتجميل',
  bank_transfer_account: 'حساب رقم: 1020304050 / بنك التضامن',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('wed_store_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStorageOrLocalUpdate = () => {
      const saved = localStorage.getItem('wed_store_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageOrLocalUpdate);
    window.addEventListener('settings_updated', handleStorageOrLocalUpdate);

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (data && !error) {
          setSettings(prev => {
            const merged = { ...prev, ...data };
            try {
              localStorage.setItem('wed_store_settings', JSON.stringify(merged));
            } catch (storageErr) {
              console.warn('LocalStorage save warning:', storageErr);
            }
            return merged;
          });
        }
      } catch (err) {
        // Fallback to local settings
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    const channel = supabase
      .channel('wed-settings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new) {
          setSettings(prev => {
            const merged = { ...prev, ...payload.new };
            try {
              localStorage.setItem('wed_store_settings', JSON.stringify(merged));
            } catch (storageErr) {
              console.warn('LocalStorage save warning:', storageErr);
            }
            return merged;
          });
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', handleStorageOrLocalUpdate);
      window.removeEventListener('settings_updated', handleStorageOrLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      
      try {
        localStorage.setItem('wed_store_settings', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage save quota error:', storageErr);
      }
      
      window.dispatchEvent(new Event('settings_updated'));
      window.dispatchEvent(new Event('storage'));

      // Attempt Supabase sync
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ id: 'store-settings-id', ...updated, updated_at: new Date().toISOString() });

        if (error) {
          console.warn('Supabase settings upsert warning:', error.message);
        }
      } catch (dbErr) {
        // Supabase optional sync
      }
      return { success: true };
    } catch (error) {
      return { success: true }; // Local save still succeeded
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

