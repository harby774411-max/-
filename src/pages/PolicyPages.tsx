import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, FileText, ArrowRight, ShoppingBag, HelpCircle } from 'lucide-react';

export const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 arabic-text">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 border-b border-brand-border/60 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-text">سياسة الشحن والتوصيل</h1>
            <p className="text-xs text-brand-muted mt-0.5">تفاصيل ومواعيد توصيل طلبات متجر «وِد» في اليمن</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-brand-text/90 leading-relaxed">
          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              التوصيل داخل أمانة العاصمة صنعاء
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-brand-text/80 pr-2">
              <li><strong>التوصيل القياسي:</strong> مجاني بالكامل لجميع الطلبات المؤكدة، ويتم التسليم خلال 24 ساعة.</li>
              <li><strong>التوصيل المستعجل:</strong> متاح داخل صنعاء برسوم 1,500 ر.ي فقط ويتم التسليم خلال 12 ساعة من تأكيد الطلب.</li>
            </ul>
          </section>

          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              الشحن إلى بقية المحافظات اليمنية
            </h2>
            <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed mb-2">
              نوفر الشحن الموثوق والآمن لكافة المحافظات اليمنية (عدن، تعز، إب، حضرموت، الحديدة، ذمار، مأرب، وباقي المدن) عبر شركات النقل المعتمدة.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-brand-text/80 pr-2">
              <li><strong>رسوم الشحن الافتراضية:</strong> 3,000 ر.ي للمحافظات، وتخضع للتعديل حسب وزن الشحنة وبعد المدينة.</li>
              <li><strong>مدة الشحن:</strong> تصل الشحنات خلال 48 إلى 72 ساعة عمل.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl border border-brand-border/60">
            <h2 className="font-bold text-sm text-brand-text mb-2">حالات التأخير الخارجة عن الإرادة</h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              قد يطرأ تأخير طفيف في مواعيد الشحن بين المحافظات في الحالات الجوية الاستثنائية، أو إجراءات الطرقات السريعة، ويتم إبلاغ العميل فوراً بأي مستجدات عبر رسائل الواتساب الخاصة بالتتبع.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <Link to="/products" className="inline-flex items-center gap-2 bg-brand-blue text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-blue/90">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ReturnsPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 arabic-text">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 border-b border-brand-border/60 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-pink/20 flex items-center justify-center text-brand-burgundy">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-text">سياسة الاسترجاع والاستبدال</h1>
            <p className="text-xs text-brand-muted mt-0.5">ضمان الرضا والجودة لعملاء «وِد»</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-brand-text/90 leading-relaxed">
          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2">شروط الاسترجاع والاستبدال</h2>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-brand-text/80 pr-2">
              <li>يحق للعميل طلب الاستبدال أو الاسترجاع خلال <strong>3 أيام</strong> من تاريخ استلام الشحنة.</li>
              <li>يجب أن يكون المنتج في حالته الأصلية، مغلفاً بغلاف المصنع، وغير مفتوح أو مستخدم نظراً لطبيعة مستحضرات العناية الشخصية وحفاظاً على الصحة والسلامة العامة.</li>
              <li>في حال استلام منتج تالف أو مختلف عن الطلب، يتحمل متجر «وِد» كامل تكاليف الشحن والاستبدال الفوري.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl border border-brand-border/60">
            <h2 className="font-bold text-sm text-brand-text mb-2">طريقة تقديم طلب استرجاع أو استبدال</h2>
            <p className="text-xs text-brand-muted leading-relaxed mb-3">
              يسعدنا خدمتك عبر التواصل المباشر مع خدمة العملاء عبر تطبيق الواتساب مع إرفاق رقم الطلب وصورة للمنتج المستلم:
            </p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline">
              <span>التواصل مع خدمة العملاء</span>
              <ArrowRight size={14} />
            </Link>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <Link to="/products" className="inline-flex items-center gap-2 bg-brand-blue text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-blue/90">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 arabic-text">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 border-b border-brand-border/60 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-text">سياسة الخصوصية وحماية البيانات</h1>
            <p className="text-xs text-brand-muted mt-0.5">التزامنا بحفظ أمان وخصوصية معلوماتك</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-brand-text/90 leading-relaxed">
          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2">البيانات التي نجمعها</h2>
            <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed">
              نجمع فقط البيانات الضرورية لتنفيذ طلبك بدقة وتوصيله، وتشمل: (الاسم، رقم الهاتف/الواتساب، المحافظة والمنطقة وتفاصيل العنوان). لا يتم جمع أي بيانات بنكية أو بطاقات ائتمانية من خلال المتصفح.
            </p>
          </section>

          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2">كيفية استخدام البيانات</h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-brand-text/80 pr-2">
              <li>تأكيد وتجهيز وشحن طلبك بدقة.</li>
              <li>إرسال تحديثات حالة الشحنة ورابط التتبع عبر الواتساب.</li>
              <li>تقديم هدايا ومفاجآت أعياد الميلاد في حال وافقت العميلة على تسجيل تاريخ ميلادها اختيارياً.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl border border-brand-border/60">
            <h2 className="font-bold text-sm text-brand-text mb-2">أمان وسرية المعلومات</h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              يلتزم متجر «وِد» بعدم بيع أو مشاركة بيانات عملائه مع أي طرف ثالث لأغراض دعائية، وتقتصر مشاركة بيانات التوصيل على مندوب التوصيل أو شركة الشحن المعتمدة فقط.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <Link to="/products" className="inline-flex items-center gap-2 bg-brand-blue text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-blue/90">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  );
};

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 arabic-text">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 border-b border-brand-border/60 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-text">الشروط والأحكام</h1>
            <p className="text-xs text-brand-muted mt-0.5">ضوابط استخدام وتسوق متجر «وِد»</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-brand-text/90 leading-relaxed">
          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2">1. الأسعار والدفع</h2>
            <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed">
              جميع الأسعار المعروضة في المتجر بالريال اليمني (ر.ي) وشاملة للمواصفات الموضحة في تفاصيل كل مستحضر. يتوفر الدفع نقداً عند الاستلام أو عبر التحويل المالي المباشر (الكريمي، فلوسك، ون كاش).
            </p>
          </section>

          <section className="bg-brand-cream/50 p-4 sm:p-6 rounded-2xl border border-brand-border/40">
            <h2 className="font-bold text-base text-brand-text mb-2">2. توفر المخزون وتأكيد الطلبات</h2>
            <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed">
              يتم تأكيد الطلب إما عبر مكالمة هاتفية أو رسالة واتساب مع خدمة العملاء لضمان مطابقة بيانات العنوان وتوفر المنتجات فورياً.
            </p>
          </section>

          <section className="p-4 rounded-2xl border border-brand-border/60">
            <h2 className="font-bold text-sm text-brand-text mb-2">3. الاستخدام والإرشادات</h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              المعلومات الإرشادية واختبار تحديد نوع البشرة المقدم في المتجر هي نصائح توجيهية صيدلانية لدعم روتين العناية، ولا تعد بديلاً عن الاستشارة الطبية للأمراض الجلدية المزمنة.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
          <Link to="/products" className="inline-flex items-center gap-2 bg-brand-blue text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-blue/90">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 arabic-text">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-sm">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full uppercase tracking-wider">
          خطأ 404
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-brand-text mt-3 mb-2">
          الصفحة المطلوبة غير موجودة
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6">
          عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو قد تم نقله أو تغييره. يمكنك العودة واستكشاف مستحضرات العناية الفاخرة من «وِد».
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue/90 transition-colors shadow-xs"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cream text-brand-text border border-brand-border text-xs font-bold hover:bg-brand-cream/80 transition-colors"
          >
            <ShoppingBag size={14} />
            <span>تصفح المنتجات</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
