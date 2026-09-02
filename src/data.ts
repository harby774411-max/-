import { Product, Category, Coupon } from './types';

export const CATEGORIES: Category[] = [
  { 
    id: 'all', 
    nameAr: 'الكل', 
    nameEn: 'All Products', 
    icon: 'Sparkles', 
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
    description: 'كل ما تحتاجه بشرتك من لمسات وِد المخملية' 
  },
  { 
    id: 'serums', 
    nameAr: 'السيرومات', 
    nameEn: 'Luxury Serums', 
    icon: 'FlaskConical', 
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    description: 'تركيبات مركزة تعزز النضارة والشباب' 
  },
  { 
    id: 'moisturizers', 
    nameAr: 'المرطبات', 
    nameEn: 'Moisturizers', 
    icon: 'Droplets', 
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400',
    description: 'ترطيب عميق وترميم لحاجز البشرة' 
  },
  { 
    id: 'cleansers', 
    nameAr: 'الغسولات', 
    nameEn: 'Cleansers', 
    icon: 'Sparkles', 
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
    description: 'تنقية لطيفة تحافظ على توازن الزيوت الطبيعية' 
  },
  { 
    id: 'masks', 
    nameAr: 'الماسكات', 
    nameEn: 'Masks & Treatments', 
    icon: 'Flower2', 
    image: 'https://images.unsplash.com/photo-1567928815104-b690029b35b6?auto=format&fit=crop&q=80&w=400',
    description: 'جلسات عناية منزلية مفعمة بالراحة' 
  },
  { 
    id: 'sun-care', 
    nameAr: 'واقيات الشمس', 
    nameEn: 'Sun Protection', 
    icon: 'Sun', 
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    description: 'حماية متطورة وشفافة من الأشعة الضارة' 
  },
  { 
    id: 'bundles', 
    nameAr: 'الباقات', 
    nameEn: 'Gift Bundles', 
    icon: 'Gift', 
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    description: 'مجموعات مخصصة للهدايا والروتينات الكاملة' 
  },
];

export const SKIN_TYPES = [
  { id: 'all', nameAr: 'لجميع أنواع البشرة' },
  { id: 'dry', nameAr: 'البشرة الجافة' },
  { id: 'oily', nameAr: 'البشرة الدهنية' },
  { id: 'combination', nameAr: 'البشرة المختلطة' },
  { id: 'sensitive', nameAr: 'البشرة الحساسة' },
  { id: 'normal', nameAr: 'البشرة العادية' },
];

export const SKIN_GOALS = [
  { id: 'all', nameAr: 'جميع الأهداف' },
  { id: 'glow', nameAr: 'النضارة والإشراق' },
  { id: 'hydration', nameAr: 'الترطيب العميق' },
  { id: 'whitening', nameAr: 'توحيد اللون والتفتيح' },
  { id: 'barrier_repair', nameAr: 'ترميم حاجز البشرة' },
  { id: 'anti_aging', nameAr: 'مقاومة علامات التقدم بالسن' },
  { id: 'protection', nameAr: 'الحماية اليومية' },
];

export const YEMEN_GOVERNORATES = [
  { id: 'sanaa', nameAr: 'صنعاء (أمانة العاصمة)', fee: 0, note: 'توصيل قياسي مجاني وسريع', expressAvailable: true },
  { id: 'sanaa_rural', nameAr: 'ضواحي صنعاء', fee: 1500, note: 'خلال 24-48 ساعة', expressAvailable: false },
  { id: 'aden', nameAr: 'عدن', fee: 3000, note: 'عبر شركات النقل المعتمدة', expressAvailable: false },
  { id: 'taiz', nameAr: 'تعز', fee: 3000, note: 'عبر شركات النقل المعتمدة', expressAvailable: false },
  { id: 'ibb', nameAr: 'إب', fee: 3000, note: 'توصيل سريع ومباشر', expressAvailable: false },
  { id: 'hadramout', nameAr: 'حضرموت (المكلا / سيئون)', fee: 3000, note: 'شحن آمن ومضمون', expressAvailable: false },
  { id: 'hodeidah', nameAr: 'الحديدة', fee: 3000, note: 'عبر شركات النقل المعتمدة', expressAvailable: false },
  { id: 'dhamar', nameAr: 'ذمار', fee: 3000, note: 'توصيل مباشر', expressAvailable: false },
  { id: 'marib', nameAr: 'مأرب', fee: 3000, note: 'شحن آمن', expressAvailable: false },
  { id: 'other', nameAr: 'محافظة أخرى', fee: 3000, note: 'شحن عبر شركات النقل المعتمدة', expressAvailable: false },
];

export const WED_ROUTINES = [
  {
    id: 'minimalist',
    title: 'الروتين الأساسي البسيط',
    subtitle: 'Minimalist Essential Routine',
    tag: 'للإشراقة اليومية السريعة',
    description: 'خطوات نقية ومختصرة تناسب الاستخدام اليومي وتمنح البشرة توازناً ونضارة مستمرة.',
    steps: ['غسول وِد الرغوي المنقي', 'مرطب وِد المخملي المغذي', 'واقي شمس وِد الشفاف'],
    productIds: ['wed-103', 'wed-102', '5'],
    idealFor: 'البشرة العادية والمختلطة للمحافظة على التوازن',
  },
  {
    id: 'radiance',
    title: 'روتين النضارة والإشراق',
    subtitle: 'Glow & Radiance Routine',
    tag: 'الأكثر طلباً للعرائس والمناسبات',
    description: 'مزيج فاخر من مضادات الأكسدة وفيتامين سي لاستعادة حيوية وتألق البشرة وتوحيد لونها.',
    steps: ['غسول الورد المخملي', 'سيروم النضارة الفائق', 'كريم الإشراق المرمم'],
    productIds: ['wed-103', 'wed-101', 'wed-102'],
    idealFor: 'البشرة الباهتة والمجهدة وتوحيد التصبغات',
  },
  {
    id: 'hydration',
    title: 'روتين الترطيب العميق والترميم',
    subtitle: 'Deep Hydration & Barrier Repair',
    tag: 'عناية فائقة للحواجز المتضررة',
    description: 'تركيبة مهدئة تعيد بناء حاجز الرطوبة بالببتيدات والسيراميد ومستخلصات الصبار النقية.',
    steps: ['غسول وِد اللطيف', 'سيروم الهيالورونيك اسيد المركز', 'كريم وِد المخملي المرمم'],
    productIds: ['wed-103', 'wed-101', 'wed-102'],
    idealFor: 'البشرة الجافة، المقشرة، والحساسة',
  },
  {
    id: 'royal',
    title: 'الروتين الشامل الملكي',
    subtitle: 'The Royal Comprehensive Luxury Routine',
    tag: 'تجربة سبا منزلية فاخرة ومتكاملة',
    description: 'خلاصة عناية وِد المتكاملة لتدليل حواسك وبشرتك من التنظيف العميق إلى التغذية الليلية والحماية اليومية.',
    steps: ['غسول رغوي', 'سيروم الإشراق', 'قناع الطين المنقي', 'كريم الترميم', 'واقي الشمس'],
    productIds: ['wed-103', 'wed-101', '4', 'wed-102', '5'],
    idealFor: 'العناية الأسبوعية الشاملة والتجديد الكامل',
  },
];

export const SKIN_ROUTINES = [
  {
    id: 'glow',
    titleAr: 'روتين النضارة والإشراق المخملي',
    targetSkinAr: 'البشرة الباهتة، المجهدة، والمعرضة للتصبغات',
    descriptionAr: 'تركيبة متوازنة بفيتامين C المركز ومضادات الأكسدة للمساعدة في استعادة الإشراقة وتوحيد لون البشرة.',
    stepsAr: [
      'تنظيف المسام بغسول وِد الرغوي بماء الورد',
      'تطبيق 4 قطرات من سيروم وِد الفاخر للنضارة',
      'تثبيت الإشراقة بكريم وِد المخملي المرمم',
      'الحماية الصباحية بواقي شمس وِد الشفاف SPF 50+'
    ]
  },
  {
    id: 'hydration',
    titleAr: 'روتين الترطيب العميق والترميم',
    targetSkinAr: 'البشرة الجافة، المقشرة، أو مجهدة الحاجز',
    descriptionAr: 'عناية مهدئة ومكثفة تساعد في دعم حاجز الرطوبة بالببتيدات ومركب السيراميد ومستخلص الصبار لترطيب يدوم.',
    stepsAr: [
      'تنظيف لطيف بغسول وِد الرغوي المهدئ',
      'ترطيب عميق بسيروم الهيالورونيك اسيد',
      'ترميم مكثف بطبقة من كريم وِد المخملي',
      'قناع وِد الأسبوعي لتغذية البشرة'
    ]
  },
  {
    id: 'purifying',
    titleAr: 'روتين التنقية وموازنة المسام',
    targetSkinAr: 'البشرة المختلطة والدهنية والمعرضة للمعان',
    descriptionAr: 'يساعد في تنقية المسام وموازنة الإفرازات الزائدة بلطف دون التسبب في جفاف.',
    stepsAr: [
      'تنظيف عميق مزدوج بغسول وِد المنقي',
      'قناع الطين البركاني المنقي مرتين أسبوعياً',
      'ترطيب خفيف الوزن بكريم وِد المخملي',
      'واقي شمس وِد غير اللامع والخالي من الزيوت'
    ]
  },
  {
    id: 'royal',
    titleAr: 'الروتين الشامل الملكي المتكامل',
    targetSkinAr: 'جميع أنواع البشرة - العناية الفاخرة للعرائس والمناسبات',
    descriptionAr: 'تجربة عناية منزلية راقية تجمع مستحضرات وِد لروتين متكامل يعكس النعومة والأناقة.',
    stepsAr: [
      'تنقية البشرة بالغسول الرغوي الفاخر',
      'تجديد النضارة بسيروم الإشراق',
      'تغذية وترميم فائق بكريم السيراميد',
      'عناية أسبوعية بأقنعة وِد الملكية'
    ]
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'WED10',
    discountPercent: 10,
    maxDiscount: 5000,
    minOrderAmount: 10000,
    isActive: true,
    expiresAt: '2026-12-31',
    startsAt: '2026-01-01'
  },
  {
    id: 'c-2',
    code: 'ROYAL20',
    discountPercent: 20,
    maxDiscount: 12000,
    minOrderAmount: 35000,
    isActive: true,
    expiresAt: '2026-12-31',
    startsAt: '2026-01-01'
  }
];

export const FAQS = [
  {
    q: 'ما هي مواعيد وطرق التوصيل المتاحة في صنعاء وباقي المحافظات؟',
    a: 'نوفر في «وِد» خدمة التوصيل القياسي المجاني لكافة مناطق أمانة العاصمة صنعاء خلال 24 ساعة، مع إمكانية التوصيل المستعجل خلال 12 ساعة. كما نوفر الشحن الآمن لجميع المحافظات اليمنية عبر شركات نقل موثوقة خلال 48-72 ساعة.'
  },
  {
    q: 'هل منتجات وِد آمنة ومختبرة مخبرياً؟',
    a: 'نعم بكل تأكيد. جميع مستحضرات وِد تصاغ بعناية فائقة باستخدام مكونات نقية ومدروسة، وتخضع لضوابط جودة صارمة، وخالية من البارابين والمواد القاسية على البشرة.'
  },
  {
    q: 'ما هي سياسة الاستبدال أو الاسترجاع في متجر وِد؟',
    a: 'نحن نضمن رضاكِ التام! يمكنك طلب استبدال أو استرجاع أي منتج خلال 3 أيام من تاريخ الاستلام في حال وجود أي تلف أو خطأ في الشحنة، بشرط بقاء المنتج في عبوته الأصلية غير المفتوحة.'
  },
  {
    q: 'كيف يمكنني اختيار المنتجات الأنسب لبشرتي؟',
    a: 'يمكنك استخدام اختبار تحديد نوع البشرة المتاح في الموقع أو تجربة المساعد الذكي للحصول على إرشادات مبنية على نوع بشرتك وهدفك الجمالي.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'wed-101',
    slug: 'wed-radiance-serum',
    sku: 'WED-SRM-01',
    productId: 'WED-SRM-01',
    nameAr: 'سيروم وِد الفاخر لإشراقة ونضارة البشرة',
    nameEn: 'WED Luxury Radiance & Glow Serum',
    shortDescriptionAr: 'سيروم مكثف بحمض الهيالورونيك وفيتامين سي النقي لنضارة فورية وإشراقة طبيعية.',
    descriptionAr: 'تحفة العناية المخملية من «وِد»، سيروم مكثف غني بحمض الهيالورونيك ثلاثي الأبعاد ومستخلص فيتامين سي النقي المعزز بمضادات الأكسدة. يساعد في منح بشرتك تألقاً طبيعياً ويستعيد حيويتها ونعومتها الحريرية.',
    descriptionEn: 'An intensive radiance serum with triple hyaluronic acid and stable vitamin C for a timeless glow.',
    benefits: [
      'يساعد في تعزيز النضارة والإشراقة الطبيعية للبشرة',
      'ترطيب عميق يقلل من مظهر الخطوط السطحية الجافة',
      'يساعد على توحيد لون البشرة وحمايتها من العوامل البيئية'
    ],
    ingredients: 'حمض الهيالورونيك ثلاثي الأوزان، فيتامين C النقي 12%، مستخلص ماء الورد الجوري الطبيعي، نياسيناميد 4%، مستخلص الشاي الأبيض.',
    ingredientsAr: 'حمض الهيالورونيك ثلاثي الأوزان، فيتامين C النقي 12%، مستخلص ماء الورد الجوري الطبيعي، نياسيناميد 4%، مستخلص الشاي الأبيض.',
    ingredientsEn: 'Triple-Weight Hyaluronic Acid, Vitamin C 12%, Pure Damask Rose Water, Niacinamide 4%, White Tea Extract.',
    usage: 'ضعي 3-4 قطرات على بشرة نظيفة ورطبة قليلاً كل صباح ومساء، ودلكي بلطف بحركات دائرية تصاعدية حتى تمتصه البشرة تماماً.',
    usageAr: 'ضعي 3-4 قطرات على بشرة نظيفة ورطبة قليلاً كل صباح ومساء، ودلكي بلطف بحركات دائرية تصاعدية حتى تمتصه البشرة تماماً.',
    precautionsAr: 'للاستخدام الخارجي فقط. يُنصح بإجراء اختبار حساسية على مساحة صغيرة من الذراع قبل الاستخدام الأول. يُحفظ في مكان بارد ومظلم.',
    size: '30 مل',
    skinTypes: ['all', 'dry', 'combination', 'normal'],
    skinType: 'all',
    concern: 'النضارة والإشراق وتوحيد المظهر',
    goal: 'glow',
    step: 'serum',
    category: 'serums',
    price: 18500,
    compareAtPrice: 23000,
    priceBefore: 23000,
    discountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608248597359-216503c299c8?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608248597359-216503c299c8?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 24,
    lowStockThreshold: 5,
    published: true,
    featured: true,
    isFeatured: true,
    isNew: true,
    badge: 'الأكثر مبيعاً',
    rating: 4.9,
    reviewsCount: 48,
    recommendationReason: 'مناسب لجميع أنواع البشرة لدعم النضارة الفورية بفيتامين C وحمض الهيالورونيك ثلاثي الأبعاد.',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: 'wed-102',
    slug: 'wed-velvet-cream',
    sku: 'WED-CRM-02',
    productId: 'WED-CRM-02',
    nameAr: 'كريم وِد المخملي لترميم وترطيب حاجز البشرة',
    nameEn: 'WED Velvet Barrier Repair Cream',
    shortDescriptionAr: 'كريم غني بالسيراميد الخماسي وزبدة الشيا لتهدئة الجفاف وحبس الرطوبة.',
    descriptionAr: 'كريم فاخر بقوام مخملي ناعم يغمر بشرتك بالراحة العميقة. مدعوم بمركب السيراميد الخماسي وزبدة الشيا لتهدئة الجفاف والمساعدة في ترميم حاجز الرطوبة الطبيعي مع ترطيب يدوم طويلاً.',
    descriptionEn: 'Luxurious velvety cream powered by 5-Ceramide complex and organic shea butter to replenish skin barrier.',
    benefits: [
      'يساعد في ترميم وتقوية حاجز البشرة الطبيعي',
      'ترطيب مكثف ومهدئ للبشرة الجافة والمتحسسة',
      'ملمس حريري غير دهني يمتص بسرعة'
    ],
    ingredients: 'مركب السيراميد الخماسي (Ceramides 1, 2, 3, 6-II, 9)، زبدة الشيا العضوية، ببتيدات نباتية، مستخلص الصبار النقي، فيتامين E.',
    ingredientsAr: 'مركب السيراميد الخماسي (Ceramides 1, 2, 3, 6-II, 9)، زبدة الشيا العضوية، ببتيدات نباتية، مستخلص الصبار النقي، فيتامين E.',
    ingredientsEn: '5-Ceramide Complex, Organic Shea Butter, Plant Peptides, Pure Aloe Vera, Vitamin E.',
    usage: 'يُوزع كمية مناسبة صباحاً ومساءً كخطوة أخيرة في روتين العناية، مع التركيز على المناطق الجافة.',
    usageAr: 'يُوزع كمية مناسبة صباحاً ومساءً كخطوة أخيرة في روتين العناية، مع التركيز على المناطق الجافة.',
    precautionsAr: 'تجنبي ملامسة العينين مباشرة. في حال حدوث تهيج، أوقفي الاستخدام واستشيري مختص العناية.',
    size: '50 مل',
    skinTypes: ['dry', 'sensitive', 'normal'],
    skinType: 'dry',
    concern: 'الجفاف الشديد وترميم حاجز الرطوبة',
    goal: 'barrier_repair',
    step: 'moisturizer',
    category: 'moisturizers',
    price: 16000,
    compareAtPrice: 19500,
    priceBefore: 19500,
    discountPercent: 18,
    imageUrl: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 18,
    lowStockThreshold: 4,
    published: true,
    featured: true,
    isFeatured: true,
    isNew: true,
    badge: 'ترطيب عميق',
    rating: 4.8,
    reviewsCount: 36,
    recommendationReason: 'مناسب للبشرة الجافة والحساسة لترميم حاجز الرطوبة وتهدئة الشد بخماسي السيراميد.',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-08-21T12:00:00Z'
  },
  {
    id: 'wed-103',
    slug: 'wed-rose-cleanser',
    sku: 'WED-CLN-03',
    productId: 'WED-CLN-03',
    nameAr: 'غسول وِد الرغوي المنقي بخلاصة الورد والأحماض اللطيفة',
    nameEn: 'WED Gentle Rose Purifying Foaming Cleanser',
    shortDescriptionAr: 'رغوة حريرية تنظف المسام بعمق دون تجريد البشرة من زيوتها الطبيعية.',
    descriptionAr: 'رغوة حريرية نقية تنظف المسام بلطف وتزيل الشوائب وبقايا المكياج دون أن تجرد البشرة من توازنها الطبيعي، لتترك وجهك ناعماً ومنتعشاً بعبق الورد المخملي.',
    descriptionEn: 'A delicate rose foaming cleanser that removes impurities while respecting the natural moisture mantle.',
    benefits: [
      'تنظيف لطيف للمسام والزيوت الزائدة والشوائب',
      'يحافظ على توازن حموضة البشرة ورطوبتها',
      'مستخلص الورد والبابونج لتهدئة البشرة أثناء الغسيل'
    ],
    ingredients: 'ماء الورد الدمشقي، حمض الساليسيليك اللطيف 0.5%، مستخلص البابونج المهدئ، جلسرين نباتي نقي، بانثينول (B5).',
    ingredientsAr: 'ماء الورد الدمشقي، حمض الساليسيليك اللطيف 0.5%، مستخلص البابونج المهدئ، جلسرين نباتي نقي، بانثينول (B5).',
    ingredientsEn: 'Damask Rose Water, Mild Salicylic Acid 0.5%, Chamomile Extract, Pure Vegetable Glycerin, Panthenol.',
    usage: 'ضعي ضخة أو ضختين على كف اليد الرطبة، دلكي الوجه بحركات دائرية لمدة 60 ثانية، ثم اشطفي جيداً بالماء الفاتر.',
    usageAr: 'ضعي ضخة أو ضختين على كف اليد الرطبة، دلكي الوجه بحركات دائرية لمدة 60 ثانية، ثم اشطفي جيداً بالماء الفاتر.',
    precautionsAr: 'مناسب للاستخدام اليومي صباحاً ومساءً. يُحفظ بعيداً عن متناول الأطفال وأشعة الشمس المباشرة.',
    size: '150 مل',
    skinTypes: ['combination', 'oily', 'normal', 'sensitive'],
    skinType: 'combination',
    concern: 'تنظيف المسام والتحكم بالزيوت الزائدة',
    goal: 'cleansing',
    step: 'cleanser',
    category: 'cleansers',
    price: 11500,
    compareAtPrice: null,
    priceBefore: null,
    discountPercent: 0,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 35,
    lowStockThreshold: 5,
    published: true,
    featured: true,
    isFeatured: true,
    isNew: true,
    badge: 'جديد',
    rating: 4.7,
    reviewsCount: 29,
    recommendationReason: 'مناسب للبشرة المختلطة والدهنية لتنقية المسام بمستخلص الورد وحمض الساليسيليك اللطيف دون تجفيف.',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-08-22T12:00:00Z'
  },
  {
    id: 'wed-104',
    slug: 'wed-royal-bundle',
    sku: 'WED-BDL-04',
    productId: 'WED-BDL-04',
    nameAr: 'باقة وِد الملكية المتكاملة للعناية الفاخرة',
    nameEn: 'WED Royal Luxury Skincare Bundle',
    shortDescriptionAr: 'المجموعة الكاملة الأيقونية: السيروم + الكريم + الغسول في حقيبة مخملية فاخرة.',
    descriptionAr: 'الباقة الأكثر تميزاً وطلباً! تحتوي على المجموعة الكاملة: سيروم النضارة + كريم الترميم المخملي + الغسول المنقي، مع حقيبة وِد المخملية الأنيقة وبطاقة إهداء مخصصة.',
    descriptionEn: 'The ultimate luxury bundle containing the complete Wed signature routine with a velvet beauty pouch.',
    benefits: [
      'روتين عناية يومي متكامل (تنظيف + نضارة + ترطيب)',
      'توفير مميز مقارنة بشراء المنتجات بشكل منفصل',
      'تتضمن حقيبة وِد المخملية وبطاقة إهداء أنيقة'
    ],
    ingredients: 'تحتوي الباقة على المكونات الطبيعية والفعالة الكاملة للمنتجات الثلاثة الأساسية.',
    ingredientsAr: 'تحتوي الباقة على المكونات الطبيعية الكاملة للمنتجات الثلاثة الأساسية.',
    ingredientsEn: 'Full spectrum botanical and active formulations.',
    usage: 'تطبيق روتين وِد اليومي: الغسول أولاً، ثم قطرات السيروم، ثم كريم الترميم للمحافظة على النضارة والترطيب.',
    usageAr: 'تطبيق روتين وِد اليومي: الغسول أولاً، ثم قطرات السيروم، ثم كريم الترميم للحفاظ على النضارة والترطيب.',
    precautionsAr: 'راجعي تفاصيل كل منتج داخل الباقة.',
    size: 'مجموعة متكاملة (3 مستحضرات أساسية)',
    skinTypes: ['all', 'dry', 'combination', 'normal', 'sensitive'],
    skinType: 'all',
    concern: 'العناية الشاملة والنضارة وتجديد البشرة',
    goal: 'glow',
    step: 'treatment',
    category: 'bundles',
    price: 41500,
    compareAtPrice: 46000,
    priceBefore: 46000,
    discountPercent: 10,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 12,
    lowStockThreshold: 3,
    published: true,
    featured: true,
    isFeatured: true,
    isNew: true,
    badge: 'باقة وِد الحصرية',
    rating: 5.0,
    reviewsCount: 52,
    recommendationReason: 'باقة روتين متكاملة تجمع التنظيف والترطيب والنضارة لجميع أنواع البشرة في مجموعة واحدة موفرة.',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-22T12:00:00Z'
  },
  {
    id: '4',
    slug: 'wed-volcanic-mask',
    sku: 'WED-MSK-05',
    productId: 'WED-MSK-05',
    nameAr: 'قناع وِد البركاني المنقي بالأعشاب الطبيعية',
    nameEn: 'WED Purifying Volcanic Botanical Mask',
    shortDescriptionAr: 'قناع طيني بركاني ينقي المسام بلطف ويمنح البشرة نقاءً وانتعاشاً.',
    descriptionAr: 'قناع طيني طبيعي يعمل على تنقية المسام وامتصاص الشوائب الزائدة، يمنح البشرة إحساساً بالنقاء والانتعاش ونعومة الملمس.',
    descriptionEn: 'Deep purifying botanical clay mask to minimize pores and refine skin texture.',
    benefits: [
      'يساعد في امتصاص الدهون الزائدة وتنقية مظهر المسام',
      'ينعم ملمس البشرة ويعيد إليها الحيوية والانتعاش',
      'غني بمستخلصات النعناع والبابونج لتهدئة البشرة'
    ],
    ingredients: 'طين بركاني نقي، كاولين أبيض، مستخلص النعناع والبابونج، فحم نباتي منشط، جلسرين نباتي.',
    ingredientsAr: 'طين بركاني نقي، كاولين أبيض، مستخلص النعناع والبابونج، فحم نباتي منشط.',
    size: '100 جم',
    skinTypes: ['oily', 'combination'],
    skinType: 'oily',
    concern: 'المسام الواسعة وتراكم الإفرازات الزائدة',
    goal: 'cleansing',
    step: 'mask',
    category: 'masks',
    price: 14500,
    compareAtPrice: 17000,
    priceBefore: 17000,
    discountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1567928815104-b690029b35b6?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1567928815104-b690029b35b6?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1567928815104-b690029b35b6?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 15,
    lowStockThreshold: 4,
    published: true,
    featured: false,
    isFeatured: false,
    isNew: false,
    badge: 'تنقية عميقة',
    rating: 4.6,
    reviewsCount: 31,
    recommendationReason: 'مناسب للبشرة الدهنية والمعرضة للانسدادات لامتصاص اللمعان الزائد وتصغير مظهر المسام.',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: '5',
    slug: 'wed-velvet-sunscreen',
    sku: 'WED-SUN-06',
    productId: 'WED-SUN-06',
    nameAr: 'واقي شمس وِد المخملي الشفاف SPF 50+',
    nameEn: 'WED Invisible Velvet Sunscreen SPF 50+',
    shortDescriptionAr: 'حماية يومية واسعة النطاق بلمسة مخملية شفافة لا تترك أي أثر أبيض.',
    descriptionAr: 'درع الحماية اليومي الفاخر بتركيبة مائية خفيفة تمتص في ثوانٍ بدون أي أثر أبيض أو ملمس دهني، مثالي للاستخدام اليومي وتحت المكياج.',
    descriptionEn: 'Ultra-lightweight invisible broad-spectrum sun defense with a velvet satin finish.',
    benefits: [
      'حماية واسعة المدى SPF 50+ ضد الأشعة الضارة',
      'شفاف تماماً ولا يترك أي خطوط بيضاء أو ملمس لزج',
      'مدعوم بالنياسيناميد ومضادات الأكسدة لدعم حاجز البشرة'
    ],
    ingredients: 'فلاتر حماية متطورة، أكسيد الزنك المعالج، نياسيناميد، مستخلص الشاي الأخضر، فيتامين E.',
    ingredientsAr: 'فلاتر معدنية متطورة، أكسيد الزنك المعالج، نياسيناميد، مستخلص الشاي الأخضر.',
    size: '50 مل',
    skinTypes: ['all', 'oily', 'combination', 'dry', 'sensitive', 'normal'],
    skinType: 'all',
    concern: 'الحماية اليومية من الشمس والعوامل الخارجية',
    goal: 'protection',
    step: 'sunscreen',
    category: 'sun-care',
    price: 15500,
    compareAtPrice: 18000,
    priceBefore: 18000,
    discountPercent: 14,
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800'
    ],
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800'
    ],
    stock: 28,
    lowStockThreshold: 5,
    published: true,
    featured: false,
    isFeatured: false,
    isNew: false,
    badge: 'حماية مخملية',
    rating: 4.8,
    reviewsCount: 64,
    recommendationReason: 'مناسب للحماية اليومية الشفافة لجميع أنواع البشرة بدون لمعان أو أثر دهني.',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  }
];

export const MOCK_PRODUCTS_LIST = PRODUCTS;

/**
 * Returns custom products added or updated via the Admin Dashboard
 */
export function getCustomProducts(): Product[] {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('wed_custom_products') : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

/**
 * Returns only published and valid products
 */
export function getPublishedProducts(): Product[] {
  const custom = getCustomProducts();
  const all = [...custom, ...PRODUCTS];
  const seen = new Set<string>();
  const deduped: Product[] = [];

  for (const p of all) {
    if (p.id && !seen.has(p.id)) {
      seen.add(p.id);
      deduped.push(p);
    }
  }

  return deduped.filter(p => p.published !== false && p.price > 0 && Boolean(p.nameAr) && (Boolean(p.imageUrl) || (p.images && p.images.length > 0)));
}

/**
 * Finds a product by either its unique id or slug
 */
export function findProduct(idOrSlug: string): Product | undefined {
  if (!idOrSlug) return undefined;
  const custom = getCustomProducts();
  const all = [...custom, ...PRODUCTS];
  const lower = idOrSlug.toLowerCase();
  return all.find(p => 
    p.id === idOrSlug || 
    p.slug === idOrSlug || 
    p.slug?.toLowerCase() === lower ||
    p.productId === idOrSlug ||
    p.productId?.toLowerCase() === lower
  );
}
