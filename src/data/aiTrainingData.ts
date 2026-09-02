import { Product } from '../types';

export interface AiTrainingRule {
  id: string;
  title: string;
  keywords: string; // Comma separated or phrase list
  questionExample: string;
  response: string;
  recommendedProductIds: string[]; // e.g. ['1', '2', 'serum-vit-c']
  category: 'skin_concerns' | 'routines' | 'products' | 'shipping_payment' | 'safety_pregnancy' | 'general';
  isActive: boolean;
  order?: number;
}

export const DEFAULT_AI_TRAINING_RULES: AiTrainingRule[] = [
  {
    id: 'rule-acne-oily',
    title: 'حبوب الوجه، المسامات الواسعة، والدهون الزائدة',
    keywords: 'حبوب, حب الشباب, بثور, دهون, دهنية, زيوان, رؤوس سوداء, مسامات, لمعان, افرازات دهنية, مسام واسع',
    questionExample: 'بشرتي دهنية وتطلع فيها حبوب ومساماتي واسعة، ايش أفضل روتين؟',
    response: `للبشرة الدهنية والمعرضة للحبوب والمسامات الواسعة، ننصحكِ بروتين ود الصيدلاني المعتمد:
1. غسيل الوجه مرتين يومياً بـ «غسول التوازن اللطيف» لتنظيف المسام دون تجريد البشرة من ترطيبها.
2. تطبيق «سيروم النياسيناميد والزنك» صباحاً ومساءً لتهدئة الحبوب وتنظيم إفراز الدهون وتقليص حجم المسام.
3. ترطيب خفيف وغير دهني لحماية حاجز البشرة.
4. استخدام «واقي الشمس الشفاف SPF 50+» لحماية الآثار من الاسمرار.`,
    recommendedProductIds: ['1', '4', 'serums', 'cleansers'],
    category: 'skin_concerns',
    isActive: true,
    order: 1
  },
  {
    id: 'rule-pigmentation-glow',
    title: 'التصبغات، الكلف، آثار الحبوب، والنضارة والتفتيح',
    keywords: 'تصبغات, كلف, بقع, اثار, تفتيح, نضارة, بهتان, اسمرار, توحيد اللون, تفتيح البشرة, كولاجين',
    questionExample: 'عندي تصبغات وآثار حبوب وبشرتي باهتة، كيف ارجع نضارتها؟',
    response: `لاستعادة نضارة البشرة وتوحيد لونها والتخلص من التصبغات والكلف:
1. استخدام «سيروم فيتامين C المطور مع الهيالورونيك» صباحاً على بشرة نظيفة قبل واقي الشمس لمحاربة الأكسدة وتفتيح البقع.
2. التقشير اللطيف مرتين أسبوعياً للتخلص من الخلايا الميتة وتجديد طبقات الجلد.
3. التزام كامل بـ «واقي الشمس SPF 50+» قبل الخروج بنصف ساعة لمنع تحفيز صبغة الميلانين.
4. ننصحكِ باقتناء «باقة النضارة الفاخرة» لحل متكامل وبسعر مميز.`,
    recommendedProductIds: ['1', '2', 'sunscreen'],
    category: 'skin_concerns',
    isActive: true,
    order: 2
  },
  {
    id: 'rule-dry-barrier',
    title: 'جفاف البشرة، القشور، وترميم حاجز البشرة المتضرر',
    keywords: 'جفاف, جافة, قشور, حاجز البشرة, شد, تشقق, حكة, ترطيب عميق, خشونة, بشرة مشدودة',
    questionExample: 'بشرتي جافة جداً وتتقشر وفيها شد، ايش استخدم؟',
    response: `لترميم حاجز البشرة الجافة والتخلص الفوري من الجفاف والقشور:
1. تنظيف البشرة بلطف بماء فاتر وغسول كريمي مغذي.
2. وضع «سيروم الهيالورونيك النقي» على بشرة مبللة قليلاً لحبس جزيئات الماء داخل الجلد.
3. تطبيق «كريم الترطيب المخملي بالسيراميد والبانثينول» صباحاً ومساءً لإعادة بناء جدار الحماية الطبيعي للبشرة.
4. تجنب الماء الساخن واستخدام واقي الشمس المرطب نهاراً.`,
    recommendedProductIds: ['2', '3', 'creams'],
    category: 'skin_concerns',
    isActive: true,
    order: 3
  },
  {
    id: 'rule-sensitive-redness',
    title: 'البشرة الحساسة، الاحمرار، والتهيج',
    keywords: 'حساسة, احمرار, تهيج, حكة, وردية, وخز, حساسية, بشرة سريعة التهيج',
    questionExample: 'بشرتي حساسة جداً وتحمر من أي منتج، ايش يناسبني؟',
    response: `لبشرتكِ الحساسة، نوفر في «ود» تركيبات نقية خالية 100% من العطور القاسية والكحول والبارابين:
1. البدء بـ «غسول التوازن اللطيف» بمركب السنتيلا المهدئ.
2. استخدام «كريم السيراميد والبانثينول» لتهدئة الاحمرار وتبريد البشرة.
3. نصيحة ود الذهبية: قومي دائماً بعمل اختبار حساسية (Patch Test) على جانب الرقبة لمدة 24 ساعة قبل التطبيق الكامل.`,
    recommendedProductIds: ['3', '4'],
    category: 'skin_concerns',
    isActive: true,
    order: 4
  },
  {
    id: 'rule-sunscreen-protection',
    title: 'واقي الشمس، الحماية من حرارة الجو وأشعة UV',
    keywords: 'واقي شمس, صن بلوك, حماية, شمس, spf, حرارة, اشعة, حروق الشمس, اسمرار الشمس',
    questionExample: 'ايش مميزات واقي شمس ود وهل يترك أثر أبيض؟',
    response: `واقي الشمس الشفاف من «ود» SPF 50+ هو الدرع المثالي لأجواء وطقس اليمن:
• قوام جل-كريم خفيف وفائق الامتصاص لا يترك أي أثر أبيض أو طبقة دهنية نهائياً.
• حماية واسعة النطاق من أشعة UVA و UVB المقاومة للماء والتعرق.
• غني بمضادات الأكسدة لحماية خلايا البشرة من التصبغ والشيخوخة المبكرة.
• طريقة الاستخدام: ضعي مقدار إصبعين كاملين على الوجه والرقبة قبل الخروج بـ 15 دقيقة، وجددي كل 2-3 ساعات عند التعرض المباشر للشمس.`,
    recommendedProductIds: ['5', 'sunscreen'],
    category: 'products',
    isActive: true,
    order: 5
  },
  {
    id: 'rule-anti-aging-wrinkles',
    title: 'مكافحة التجاعيد، الخطوط الدقيقة، وشد البشرة',
    keywords: 'تجاعيد, خطوط, شد, ريتينول, كولاجين, تقدم بالعمر, ترهل, مرونة البشرة',
    questionExample: 'ابغى منتج يشد البشرة ويخفف الخطوط التعبيرية والتجاعيد؟',
    response: `لمكافحة الخطوط الدقيقة واستعادة مرونة وشباب البشرة:
1. إدخال «سيروم الريتينول المغلف» ليلاً (ابدئي مرتين أسبوعياً لتعويد البشرة).
2. استخدام «سيروم الهيالورونيك والببتيدات» صباحاً ومساءً لملء الخطوط السطحية.
3. تدليك الوجه بلطف بحركات تصاعدية لتعزيز تدفق الدم وتنشيط الكولاجين.
4. الالتزام اليومي بواقي الشمس لحماية ألياف الكولاجين من التكسر بفعل الأشعة.`,
    recommendedProductIds: ['1', '2', '3'],
    category: 'routines',
    isActive: true,
    order: 6
  },
  {
    id: 'rule-pregnancy-safety',
    title: 'المنتجات الآمنة للحوامل والمرضعات',
    keywords: 'حامل, رضاعة, مرضع, الحمل, الرضاعة, امن للحامل, امن للرضاعة, جنين',
    questionExample: 'أنا حامل / مرضع، ايش المنتجات الآمنة لي في متجركم؟',
    response: `مبارك لكِ ونتمنى لكِ ولطفلكِ دوام الصحة والعافية 🌸
المستحضرات الآمنة والموصى بها أثناء فترة الحمل والرضاعة في «ود»:
• «سيروم فيتامين C النقي» لحماية البشرة من كلف الحمل واستعادة النضارة.
• «سيروم الهيالورونيك» و «كريم السيراميد المرطب» لترطيب عميق وحماية الحاجز.
• «غسول التوازن اللطيف».
• «واقي الشمس الفيزيائي».
⚠️ يُنصح بتجنب مشتقات الريتينول وفيتامين A وأحماض الساليسيليك عالية التركيز خلال الحمل.`,
    recommendedProductIds: ['1', '2', '3'],
    category: 'safety_pregnancy',
    isActive: true,
    order: 7
  },
  {
    id: 'rule-shipping-delivery',
    title: 'معلومات الشحن، التوصيل، ورسوم التوصيل لكافة المحافظات',
    keywords: 'توصيل, شحن, كم التوصيل, متى يوصل, وقت التوصيل, صنعاء, عدن, تعز, اب, حضرموت, الحديدة, مأرب, المحافظات',
    questionExample: 'كم يستغرق التوصيل وكم سعره لصنعاء وباقي المحافظات؟',
    response: `خدمات التوصيل والشحن في «ود»:
🛵 داخل أمانة العاصمة صنعاء: توصيل سريع في نفس اليوم أو خلال 24 ساعة (التوصيل مجاني للطلبات فوق 30,000 ر.ي أو بسعر رمزي). يتوفر أيضاً التوصيل السريع VIP (خلال 3 ساعات).
🚚 لجميع المحافظات اليمنية (عدن، تعز، إب، حضرموت، الحديدة، ذمار، مأرب، شبوة، لحج، صعدة): شحن آمن وموثوق يصلكِ خلال 24 إلى 48 ساعة.`,
    recommendedProductIds: [],
    category: 'shipping_payment',
    isActive: true,
    order: 8
  },
  {
    id: 'rule-payment-methods',
    title: 'طرق الدفع، الحسابات، والمحافظ المعتمدة',
    keywords: 'دفع, كاش, كريمي, جيب, ون كاش, فلوسك, حوالة, حساب بنكي, طريقة الدفع, jeeb, onecash, kuraimi',
    questionExample: 'ايش طرق الدفع المتوفرة عندكم؟',
    response: `نوفر لكِ في متجر «ود» كافة خيارات الدفع المريحة والآمنة:
1. الدفع نقداً عند الاستلام (داخل صنعاء ومعظم المدن).
2. التحويل البنكي المباشر عبر تطبيق بنك الكريمي.
3. الدفع الفوري عبر محفظة جيب الإلكترونية (Jeeb).
4. الدفع عبر محفظة ون كاش (OneCash).
5. الدفع عبر محفظة فلوسك (Floosak).
6. التحويل البنكي العادي (حوالة بنكية مباشرة).
تظهر لكِ أرقام وبيانات الحسابات فوراً في صفحة السلة عند اختيار وسيلة الدفع المناسبة.`,
    recommendedProductIds: [],
    category: 'shipping_payment',
    isActive: true,
    order: 9
  },
  {
    id: 'rule-bundles-savings',
    title: 'الباقات والعروض التوفيرية في متجر ود',
    keywords: 'باقات, باقة, عروض, خصم, تخفيض, توفير, مجموعة كاملة, روتين كامل, عرض خاص',
    questionExample: 'ايش أفضل باقة توفيرية متكاملة للعناية بالبشرة؟',
    response: `صممنا لكِ باقات «ود» لتمنحكِ روتيناً صيدلانياً متكاملاً وبخصم يصل إلى 25% مع هدايا وشحن مميز:
✨ «باقة النضارة والإشراق المتكاملة»: تجمع الغسول، سيروم فيتامين C، كريم الترطيب، وواقي الشمس.
✨ «باقة ترميم حاجز البشرة والترطيب العميق»: مخصصة للبشرة الجافة والحساسة.
✨ «باقة العناية اليومية المتوازنة»: الحل المثالي للبشرة المختلطة والدهنية.
يمكنكِ تصفح قسم الباقات في المتجر لاقتناء باقتكِ المفضلة بضغطة زر.`,
    recommendedProductIds: ['bundle-glow', 'bundle-hydration', 'bundle-daily'],
    category: 'products',
    isActive: true,
    order: 10
  }
];

/**
 * Match user query against active training rules
 */
export function findMatchingTrainingRule(
  userQuery: string,
  rules: AiTrainingRule[] = DEFAULT_AI_TRAINING_RULES
): AiTrainingRule | null {
  if (!userQuery || !userQuery.trim()) return null;
  const cleanQuery = userQuery.toLowerCase().trim();
  const activeRules = rules.filter(r => r.isActive !== false);

  // 1. Direct Keyword Matching with Score
  let bestMatch: { rule: AiTrainingRule; score: number } | null = null;

  for (const rule of activeRules) {
    const rawKeywords = (rule.keywords || '').split(/[,،\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean);
    let score = 0;

    for (const kw of rawKeywords) {
      if (cleanQuery.includes(kw)) {
        // Longer keyword matches have higher weight
        score += kw.length >= 4 ? 3 : 2;
      }
    }

    // Also check title or question example match
    if (rule.questionExample && cleanQuery.includes(rule.questionExample.toLowerCase().slice(0, 15))) {
      score += 5;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { rule, score };
    }
  }

  return bestMatch ? bestMatch.rule : null;
}
