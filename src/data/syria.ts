export type Province = {
  id: string;
  name: string;
  cities: string[];
};

export type Hotel = {
  id: string;
  name: string;
  provinceId: string; // ربط الفندق بالمحافظة
  city: string;
  rating: number;
  stars: number;
  pricePerNight: number;
  discountPrice?: number; // السعر في حال وجود عرض
  imageUrl: string;
  features: string[];
  offerText?: string; // نص العرض إن وجد
};

export const SYRIA_COUNTRY_NAME = 'Syria';

// 1. تحديث المحافظات وإضافة الـ IDs
export const SYRIA_PROVINCES: Province[] = [
  { id: 'syr-damascus', name: 'دمشق', cities: ['دمشق'] },
  { id: 'syr-rif-dimashq', name: 'ريف دمشق', cities: ['جرمانا', 'يبرود', 'دوما', 'الكسوة'] },
  { id: 'syr-homs', name: 'حمص', cities: ['حمص'] },
  { id: 'syr-hama', name: 'حماة', cities: ['حماة'] },
  { id: 'syr-aleppo', name: 'حلب', cities: ['حلب', 'عفرين'] },
  { id: 'syr-latakia', name: 'اللاذقية', cities: ['اللاذقية'] },
  { id: 'syr-tartous', name: 'طرطوس', cities: ['طرطوس'] },
  { id: 'syr-daraa', name: 'درعا', cities: ['درعا'] },
  { id: 'syr-sweida', name: 'السويداء', cities: ['السويداء'] },
  { id: 'syr-idlib', name: 'إدلب', cities: ['إدلب', 'سراقب'] },
  { id: 'syr-raqqa', name: 'الرقة', cities: ['الرقة'] },
  { id: 'syr-deir-ez-zor', name: 'دير الزور', cities: ['دير الزور'] },
  { id: 'syr-hasakah', name: 'الحسكة', cities: ['الحسكة', 'القامشلي'] },
];

// 2. مصفوفة الفنادق السورية المتكاملة مع الصور والأسعار والعروض
export const SYRIA_HOTELS: Hotel[] = [
  // فندق فور سيزونز - دمشق
  {
    id: 'hotel-four-seasons-dam',
    name: 'فندق فور سيزونز دمشق (Four Seasons)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.8,
    stars: 5,
    pricePerNight: 290,
    discountPrice: 260,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    features: ['مسبح خارجي', 'سبا فاخر', 'واي فاي مجاني', 'موقف سيارات', 'فطور ملكي'],
    offerText: 'خصم 10% للحجوزات المبكرة هذا الأسبوع!'
  },
  // فندق بيت الوالي - دمشق القديمة
  {
    id: 'hotel-beit-al-wali',
    name: 'فندق بيت الوالي التراثي (Beit Al Wali)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.9,
    stars: 5,
    pricePerNight: 250,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    features: ['طراز دمشقي قديم', 'فطور شرقي متكامل', 'ساحة سماوية غناء', 'واي فاي سريع'],
    offerText: 'عشاء دمشقي مجاني عند حجز ليلتين أو أكثر'
  },
  // فندق داماروز - دمشق
  {
    id: 'hotel-dama-rose',
    name: 'فندق داما روز (Dama Rose Hotel)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.4,
    stars: 5,
    pricePerNight: 180,
    discountPrice: 165,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    features: ['موقع حيوي مركز المدينة', 'قاعات مؤتمرات', 'مسبح', 'نادي رياضي'],
    offerText: 'عرض خاص لرجال الأعمال والشركات'
  },
  // فندق الشيراتون - دمشق
  {
    id: 'hotel-sheraton-dam',
    name: 'فندق شيراتون دمشق (Sheraton)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.5,
    stars: 5,
    pricePerNight: 240,
    imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    features: ['حدائق واسعة', 'مسابح متعددة', 'مطاعم عالمية', 'مواقف مؤمنة'],
  },
  // منتجع بلودان الكبير - ريف دمشق
  {
    id: 'hotel-bloudan-grand',
    name: 'فندق بلودان الكبير (Grand Hotel Bloudan)',
    provinceId: 'syr-rif-dimashq',
    city: 'يبرود', 
    rating: 4.3,
    stars: 4,
    pricePerNight: 95,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    features: ['إطلالة جبلية ساحرة', 'طقس بارد صيفاً', 'تراس خارجي', 'مطعم جبلي'],
    offerText: 'خصم عائلي مميز في عطلة نهاية الأسبوع'
  },
  // فندق شهباء حلب - حلب
  {
    id: 'hotel-shahba-aleppo',
    name: 'فندق شهباء حلب (Shahba Aleppo)',
    provinceId: 'syr-aleppo',
    city: 'حلب',
    rating: 4.2,
    stars: 5,
    pricePerNight: 145,
    discountPrice: 130,
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    features: ['موقع في حي الميرديان الراقي', 'مسبح كبير', 'مركز رجال أعمال', 'صالة لياقة بدنية'],
    offerText: 'شامل الفطور والإنترنت السريع مجاناً'
  },
  // فندق ريجا بالاس - حلب
  {
    id: 'hotel-riga-palace',
    name: 'فندق ريجا بالاس (Riga Palace)',
    provinceId: 'syr-aleppo',
    city: 'حلب',
    rating: 4.0,
    stars: 4,
    pricePerNight: 90,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    features: ['قريب من الخدمات وسط المدينة', 'غرف عائلية مريحة', 'مطعم بانورامي'],
  },
  // فندق سفير حمص - حمص
  {
    id: 'hotel-safir-homs',
    name: 'فندق سفير حمص (Safir Homs)',
    provinceId: 'syr-homs',
    city: 'حمص',
    rating: 4.6,
    stars: 5,
    pricePerNight: 180,
    imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    features: ['مسبح مكشوف', 'مطعم بجانب المسبح', 'حدائق هادئة', 'قريب من الكورنيش الداخلي'],
    offerText: 'دخول مجاني للنادي الرياضي طوال فترة الإقامة'
  },
  // فندق الوادي - ريف حمص (وادي النصارى)
  {
    id: 'hotel-al-wadi-homs',
    name: 'فندق وجناح الوادي السياحي (Al-Wadi Hotel)',
    provinceId: 'syr-homs',
    city: 'حمص',
    rating: 4.5,
    stars: 4,
    pricePerNight: 100,
    discountPrice: 85,
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    features: ['إطلالة على قلعة الحصن والجبال', 'تراس عائلي', 'ألعاب أطفال', 'تنظيم رحلات سياحية'],
  },
  // فندق أفاميا الشام - حماة
  {
    id: 'hotel-afamia-hama',
    name: 'فندق أفاميا الشام (Afamia Cham Hotel)',
    provinceId: 'syr-hama',
    city: 'حماة',
    rating: 4.3,
    stars: 5,
    pricePerNight: 130,
    imageUrl: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
    features: ['مطل على نهر العاصي والنواعير', 'حدائق خلابة', 'مطعم شرقي وغربي', 'أمان عالي'],
  },
  // منتجع جونادا (رويال ريزورت سابقاً) - طرطوس
  {
    id: 'hotel-junada-tartous',
    name: 'منتجع جونادا السياحي (Junada Resort)',
    provinceId: 'syr-tartous',
    city: 'طرطوس',
    rating: 4.9,
    stars: 5,
    pricePerNight: 160,
    discountPrice: 145,
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    features: ['شاطئ رملي خاص', 'ألعاب مائية (Aqua Park)', 'تراس بحري ساحر', 'عدة مطاعم'],
    offerText: 'احجز ليلة واحصل على الثانية بنصف السعر خلال هذا الشهر!'
  },
  // فندق شاهين - طرطوس
  {
    id: 'hotel-shaheen-tartous',
    name: 'فندق شاهين كورنيش طرطوس',
    provinceId: 'syr-tartous',
    city: 'طرطوس',
    rating: 4.1,
    stars: 4,
    pricePerNight: 90,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    features: ['إطلالة مباشرة على البحر والجزيرة', 'قريب من المقاهي والأسواق', 'مكيفات ممتازة'],
  },
  // فندق ومنتجع روتانا أفاميا - اللاذقية
  {
    id: 'hotel-afamia-resort-lat',
    name: 'منتجع أفاميا ريزورت اللاذقية (Afamia Hotel Resort)',
    provinceId: 'syr-latakia',
    city: 'اللاذقية',
    rating: 4.6,
    stars: 5,
    pricePerNight: 210,
    discountPrice: 190,
    imageUrl: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=800&q=80',
    features: ['شاليهات وغرف فاخرة تطل على البحر', 'مسابح خارجية للكبار والأطفال', 'واي فاي مجاني', 'ملاعب تنس'],
    offerText: 'شامل الفطور بوفيه مفتوح لشخصين مجاناً'
  },
  // فندق قصر اللاذقية (Palace Hotel)
  {
    id: 'hotel-palace-latakia',
    name: 'فندق قصر اللاذقية (Palace Hotel)',
    provinceId: 'syr-latakia',
    city: 'اللاذقية',
    rating: 4.0,
    stars: 3,
    pricePerNight: 45,
    imageUrl: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80',
    features: ['اقتصادي ومريح جداً', 'قريب من المستشفيات ومراكز الخدمات', 'طاقم عمل ودود'],
  },
  // فندق بادية الشام - دير الزور
  {
    id: 'hotel-badiat-alsham-deir',
    name: 'فندق بادية الشام (Badiat al-Sham)',
    provinceId: 'syr-deir-ez-zor',
    city: 'دير الزور',
    rating: 4.2,
    stars: 4,
    pricePerNight: 132,
    imageUrl: 'https://images.unsplash.com/photo-1554009975-d74653b879f1?auto=format&fit=crop&w=800&q=80',
    features: ['قريب من نهر الفرات', 'قاعات واسعة للمناسبات', 'تكييف مركزي متكامل', 'مطعم شرقي أصيل'],
  },
  // فندق القامشلي الكبير - الحسكة
  {
    id: 'hotel-qamishli-grand',
    name: 'فندق القامشلي سنتر (Qamishli Centre)',
    provinceId: 'syr-hasakah',
    city: 'القامشلي',
    rating: 4.1,
    stars: 4,
    pricePerNight: 110,
    imageUrl: 'https://images.unsplash.com/photo-1606046604972-77cc76aee944?auto=format&fit=crop&w=800&q=80',
    features: ['إنترنت سريع ومستقر', 'خدمة غرف على مدار 24 ساعة', 'موقع هادئ'],
  },
  // ─── الفنادق الإضافية المأخوذة من المتجر (hotelsStore) ─────────────────────
  // فندق أفاميا الشام (اللاذقية) — هو مختلف عن اللي فوق لأنه منتجع مقابل فندق
  {
    id: 'hotel-afamia-sham-latakia',
    name: 'منتجع أفاميا الشام (اللاذقية)',
    provinceId: 'syr-latakia',
    city: 'اللاذقية',
    rating: 4.9,
    stars: 5,
    pricePerNight: 210,
    discountPrice: 180,
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    features: ['شاطئ خاص', 'مسبح عائلي', 'ألعاب مائية', 'عدة مطاعم', 'إطلالة بحرية'],
    offerText: 'منتجع متكامل بخدمات عالمية'
  },
  // فندق بيت المملوكة (دمشق القديمة)
  {
    id: 'hotel-beit-mamlouka',
    name: 'فندق بيت المملوكة (دمشق القديمة)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.9,
    stars: 4,
    pricePerNight: 120,
    discountPrice: 100,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    features: ['فناء دمشقي أثري', 'بحرة ماء', 'فطور شرقي تقليدي', 'تكييف كامل', 'موقع تاريخي'],
    offerText: 'فندق تراثي بوتيكي بتجربة دمشقية أصيلة'
  },
  // فندق الشيراتون (حلب) — إضافة للفنادق الموجودة بحلب
  {
    id: 'hotel-sheraton-aleppo',
    name: 'فندق الشيراتون (حلب)',
    provinceId: 'syr-aleppo',
    city: 'حلب',
    rating: 4.6,
    stars: 5,
    pricePerNight: 145,
    discountPrice: 130,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    features: ['مركز لرجال الأعمال', 'قاعة اجتماعات', 'مطعم حلبي تراثي', 'توصيل مطار'],
  },
  // فندق ومنتجع بلو باي (طرطوس)
  {
    id: 'hotel-blue-bay-tartous',
    name: 'فندق ومنتجع بلو باي (طرطوس)',
    provinceId: 'syr-tartous',
    city: 'طرطوس',
    rating: 4.8,
    stars: 5,
    pricePerNight: 175,
    discountPrice: 155,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    features: ['مسبح خارجي', 'شاليهات خاصة', 'منطقة ألعاب أطفال', 'جلسات عالبحر'],
    offerText: 'إقامة عائلية بأسعار خاصة'
  },
  // فندق داما روز (دمشق) — هو نفسه داما روز أعلاه ولكن بموقع مختلف وخدمات إضافية
  {
    id: 'hotel-dama-rose-plus',
    name: 'فندق داما روز (دمشق)',
    provinceId: 'syr-damascus',
    city: 'دمشق',
    rating: 4.8,
    stars: 5,
    pricePerNight: 200,
    discountPrice: 180,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    features: ['مسبح خارجي', 'سبا ونادي صحي', 'واي فاي مجاني', 'مواقف سيارات', 'قاعة مؤتمرات'],
    offerText: 'أفضل أسعار الحجز المبكر'
  }
];
