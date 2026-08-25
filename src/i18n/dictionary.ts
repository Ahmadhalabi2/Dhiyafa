export type TranslationKey =
  | 'logout'
  | 'searchPlaceholder'
  | 'openMenu'
  | 'notifications'
  | 'myBookings'
  | 'profile'
  | 'hotels'
  | 'bookings'
  | 'customers'
  | 'users'
  | 'analytics'
  | 'settings'
  | 'dashboard'
  | 'addHotel'
  | 'browseHotels'
  | 'allCountries'
  | 'bookNow'
  | 'confirmBooking'
  | 'reserveYourStay'
  | 'checkIn'
  | 'checkOut'
  | 'guests'
  | 'guest'
  | 'nights'
  | 'total'
  | 'viewMyBookings'
  | 'requestSubmitted'
  | 'pendingAdminApproval'
  | 'backToHotels'
  | 'createAccount'
  | 'welcomeBack'
  | 'signInToAccount'
  | 'emailAddress'
  | 'password'
  | 'fullName'
  | 'minChars'
  | 'registerNewEnterprise'
  | 'signUp'
  | 'signIn'
  | 'dontHaveAccount'
  | 'createOneHere'
  | 'accountActions';

export type Dictionary = Record<TranslationKey, { en: string; ar: string }>;

export const DICT: Dictionary = {
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  searchPlaceholder: { en: 'Search… (press Enter)', ar: 'ابحث… (اضغط Enter)' },
  openMenu: { en: 'Open menu', ar: 'فتح القائمة' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  myBookings: { en: 'My Bookings', ar: 'حجوزاتي' },
  profile: { en: 'Your profile', ar: 'ملفك الشخصي' },

  hotels: { en: 'Hotels', ar: 'الفنادق' },
  bookings: { en: 'Bookings', ar: 'الحجوزات' },
  customers: { en: 'Customers', ar: 'العملاء' },
  users: { en: 'Users', ar: 'المستخدمون' },
  analytics: { en: 'Analytics', ar: 'التحليلات' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },

  addHotel: { en: 'Add Hotel', ar: 'إضافة فندق' },
  browseHotels: { en: 'Browse Hotels', ar: 'تصفح الفنادق' },
  allCountries: { en: 'All Countries', ar: 'كل الدول' },
  bookNow: { en: 'Book Now', ar: 'احجز الآن' },

  confirmBooking: { en: 'Confirm Booking', ar: 'تأكيد الحجز' },
  reserveYourStay: { en: 'Reserve Your Stay', ar: 'احجز إقامتك' },
  checkIn: { en: 'Check-in', ar: 'تسجيل الوصول' },
  checkOut: { en: 'Check-out', ar: 'المغادرة' },
  guests: { en: 'Guests', ar: 'الضيوف' },
  guest: { en: 'guest', ar: 'ضيف' },
  nights: { en: 'nights', ar: 'ليالٍ' },
  total: { en: 'Total', ar: 'الإجمالي' },

  viewMyBookings: { en: 'View My Bookings', ar: 'عرض حجوزاتي' },
  requestSubmitted: { en: 'Request submitted ✅', ar: 'تم إرسال الطلب ✅' },
  pendingAdminApproval: {
    en: 'Your reservation is now pending admin approval.',
    ar: 'حجزك الآن بانتظار موافقة الإدارة.',
  },
  backToHotels: { en: 'Back to Hotels', ar: 'العودة للفنادق' },

  createAccount: { en: 'Create account', ar: 'إنشاء حساب' },
  welcomeBack: { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  signInToAccount: { en: 'Sign In To Account', ar: 'تسجيل الدخول إلى الحساب' },

  emailAddress: { en: 'Email Address', ar: 'عنوان البريد الإلكتروني' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },

  minChars: { en: 'Min. 6 characters', ar: 'على الأقل 6 أحرف' },
  registerNewEnterprise: {
    en: 'Register a new enterprise',
    ar: 'تسجيل مؤسسة جديدة',
  },
  signUp: { en: 'Sign up', ar: 'إنشاء حساب' },
  signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
  dontHaveAccount: { en: "Don't have an account?", ar: 'لا تملك حساباً؟' },
  createOneHere: { en: 'Create one here', ar: 'أنشئ واحداً هنا' },

  accountActions: { en: 'Account Actions', ar: 'إجراءات الحساب' },
};

export function t(dict: Dictionary, key: TranslationKey, lang: 'en' | 'ar') {
  return dict[key][lang];
}

