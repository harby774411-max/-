import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Sparkles, ShieldCheck, Heart, CheckCircle2, Award, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../lib/useSettings';
import { WedLogo } from '../components/WedLogo';
import { Link } from 'react-router-dom';
import { 
  WhatsAppIcon, InstagramIcon, TikTokIcon, SnapchatIcon, FacebookIcon, TelegramIcon 
} from '../components/SocialIcons';

export const About = () => {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-bg min-h-screen text-brand-text">
      <div className="max-w-4xl mx-auto space-y-8 text-right">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-2xl flex items-center justify-center border border-brand-border shadow-2xs">
            <WedLogo size="sm" variant="blue" showSubtitle={false} />
          </div>
          <h1 className="arabic-text text-2xl sm:text-4xl font-black text-brand-text">
            عن «ود»
          </h1>
          <p className="arabic-text text-xs sm:text-sm text-brand-text-muted max-w-lg mx-auto">
            علامة يمنية متخصصة في مستحضرات العناية بالبشرة ذات الجودة العالية
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-2xs space-y-4">
          <h2 className="arabic-text text-lg sm:text-xl font-black text-brand-text">
            رؤيتنا ورسالتنا
          </h2>
          <p className="arabic-text text-xs sm:text-sm text-brand-text-muted leading-relaxed">
            انطلق «ود» بهدف توفير منتجات عناية بالبشرة أصلية 100%، مدروسة بعناية لتلائم طبيعة ومناخ بيئتنا المحلية، وبأسعار عادلة ومناسبة للجميع مع ضمان التوصيل السريع لجميع المحافظات.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="arabic-text font-black text-sm text-brand-text">منتجات أصلية وموثوقة</h3>
            <p className="arabic-text text-[11px] text-brand-text-muted leading-relaxed">
              نضمن سلامة ونقاء كافة المستحضرات والمكونات الفعالة.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="arabic-text font-black text-sm text-brand-text">نتائج ملموسة</h3>
            <p className="arabic-text text-[11px] text-brand-text-muted leading-relaxed">
              تركيبات تركز على الترطيب، التغذية، وحماية حاجز البشرة الطبيعي.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="arabic-text font-black text-sm text-brand-text">دعم واستشارات دائمة</h3>
            <p className="arabic-text text-[11px] text-brand-text-muted leading-relaxed">
              فريقنا متاح دائماً عبر واتساب للإجابة على استفساراتكِ ومساعدتكِ في الاختيار.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-blue-dark transition-all shadow-xs"
          >
            <span>تصفح المستحضرات</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'استفسار عن منتج',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const text = `🌸 *استفسار جديد عبر ود* 🌸\n` +
      `👤 الاسم: ${formData.name}\n` +
      `📱 الجوال: ${formData.phone}\n` +
      `📌 الموضوع: ${formData.subject}\n` +
      `💬 الرسالة:\n${formData.message || 'لا توجد رسالة إضافية'}`;

    const waNum = (settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-brand-bg min-h-screen text-brand-text">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="arabic-text text-2xl sm:text-4xl font-black text-brand-text mt-2 mb-2">
            تواصلي معنا واستشيري فريق ود
          </h1>
          <p className="arabic-text text-xs sm:text-sm text-brand-text-muted max-w-xl mx-auto leading-relaxed">
            يسعدنا استقبال استفساراتكِ ومساعدتكِ في اختيار المستحضر الأنسب لبشرتكِ، أو متابعة طلباتكِ عبر قنواتنا المباشرة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-2xs border border-brand-border"
          >
            <h2 className="arabic-text text-lg sm:text-xl font-black text-brand-text mb-4 text-right">
              أرسلي استفساركِ مباشرة
            </h2>

            {submitted ? (
              <div className="p-6 text-center bg-[#F7F9FA] rounded-xl border border-brand-border text-brand-text space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="arabic-text font-black text-base">تم توجيه رسالتكِ بنجاح!</h3>
                <p className="arabic-text text-xs text-brand-text-muted">
                  تم فتح محادثة الواتساب مع فريق خدمة عملاء «ود». سنقوم بالرد عليكِ في أقرب وقت.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-dark transition-all cursor-pointer"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="arabic-text font-bold text-xs text-brand-text">الاسم الكريم *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F7F9FA] rounded-xl border border-brand-border focus:border-brand-blue arabic-text outline-none text-xs text-brand-text placeholder-brand-text-muted/50"
                      placeholder="مثال: سارة أحمد"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="arabic-text font-bold text-xs text-brand-text">رقم الجوال (واتساب) *</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#F7F9FA] rounded-xl border border-brand-border focus:border-brand-blue arabic-text outline-none text-xs text-right text-brand-text placeholder-brand-text-muted/50 font-sans"
                      placeholder="770000000"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="arabic-text font-bold text-xs text-brand-text">موضوع الاستفسار</label>
                  <select 
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F7F9FA] rounded-xl border border-brand-border focus:border-brand-blue arabic-text outline-none text-xs text-brand-text"
                  >
                    <option value="استفسار عن منتج">استفسار عن مستحضر محدد</option>
                    <option value="استشارة لنوع البشرة">استشارة لاختيار المستحضر الأنسب</option>
                    <option value="متابعة طلب وتوصيل">متابعة شحنة وتوصيل</option>
                    <option value="ملاحظات واقتراحات">ملاحظات واقتراحات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="arabic-text font-bold text-xs text-brand-text">الرسالة أو الاستفسار *</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#F7F9FA] rounded-xl border border-brand-border focus:border-brand-blue arabic-text outline-none text-xs text-brand-text placeholder-brand-text-muted/50 resize-none"
                    placeholder="اكتبي استفساركِ هنا بالتفصيل..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold arabic-text hover:bg-brand-blue-dark transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4 rotate-180" />
                  <span>إرسال عبر واتساب المباشر</span>
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Details & Brand Info */}
          <div className="lg:col-span-5 space-y-4 text-right">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-brand-border space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-brand-border">
                <WedLogo size="xs" variant="blue" showSubtitle={false} />
                <div>
                  <h3 className="arabic-text font-black text-sm text-brand-text">متجر «وِد» للعناية بالبشرة</h3>
                  <p className="arabic-text text-[11px] text-brand-text-muted">صنعاء، الجمهورية اليمنية</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F3F6] text-brand-blue flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-text-muted block">واتساب وطلبات المتجر:</span>
                    <a href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-sans font-bold text-brand-blue hover:underline dir-ltr text-xs">
                      {settings.whatsapp_orders || settings.whatsapp || '+967 770 000 000'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F3F6] text-brand-blue flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-text-muted block">البريد الإلكتروني:</span>
                    <span className="font-sans text-brand-text">{settings.email || 'care@wedskin.ye'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F3F6] text-brand-blue flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-text-muted block">الموقع:</span>
                    <span className="arabic-text text-brand-text">صنعاء - التوصيل متوفر لجميع المحافظات</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Guarantees */}
            <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-2xs space-y-2 text-right">
              <div className="flex items-center gap-2 text-brand-blue font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>ضمان الجودة والأصالة</span>
              </div>
              <p className="arabic-text text-[11px] text-brand-text-muted leading-relaxed">
                جميع مستحضراتنا أصلية 100%، مختبرة وموثوقة لضمان أقصى درجات العناية والأمان لبشرتكِ.
              </p>
            </div>

            {/* Social Media Channels with Authentic Icons */}
            <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-2xs space-y-3 text-right">
              <span className="text-xs font-black text-brand-text block arabic-text">قنوات التواصل والمتابعة الرسمية:</span>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {settings.instagram && (
                  <a 
                    href={settings.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                    title="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5 text-white" />
                  </a>
                )}
                {settings.tiktok && (
                  <a 
                    href={settings.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                    title="TikTok"
                  >
                    <TikTokIcon className="w-5 h-5 text-white" />
                  </a>
                )}
                {settings.snapchat && (
                  <a 
                    href={settings.snapchat} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-[#FFFC00] text-black flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                    title="Snapchat"
                  >
                    <SnapchatIcon className="w-5 h-5 text-black" />
                  </a>
                )}
                {settings.facebook && (
                  <a 
                    href={settings.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                    title="Facebook"
                  >
                    <FacebookIcon className="w-5 h-5 text-white" />
                  </a>
                )}
                {settings.telegram && (
                  <a 
                    href={settings.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                    title="Telegram"
                  >
                    <TelegramIcon className="w-5 h-5 text-white" />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
