# نُزُل — Nuzul Booking Dashboard

منصة حجز فنادق سورية متكاملة مع لوحة تحكم إدارية.

---

## التقنيات المستخدمة

### الفرونتاند
- React 18 + TypeScript
- Zustand (إدارة الحالة)
- React Router v6
- Recharts (الرسوم البيانية)
- Lucide React (الأيقونات)
- Framer Motion

### الباكاند
- Node.js + Express
- MongoDB + Mongoose
- JWT للمصادقة
- Nodemailer (إرسال إيميل OTP وتأكيد الحجز)
- Multer (رفع الصور)
- bcryptjs (تشفير كلمات السر)

---

## هيكل المشروع

```
booking-admin-dashboard/
├── backend/                    # Node.js API
│   ├── server.js               # نقطة الدخول
│   ├── src/
│   │   ├── db/
│   │   │   └── connect.js      # الاتصال بـ MongoDB
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Notification.js
│   │   │   └── SupportThread.js
│   │   ├── routes/
│   │   │   ├── auth.js         # تسجيل دخول، OTP، تسجيل
│   │   │   ├── notifications.js
│   │   │   ├── support.js      # دردشة الدعم الفني
│   │   │   ├── upload.js       # رفع صور البروفايل
│   │   │   └── bookings.js     # إرسال إيميل تأكيد الحجز
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   └── otpStore.js
│   │   └── middleware/
│   │       └── rateLimiter.js
│   └── .env.example
│
├── src/                        # React Frontend
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── HotelBookingFlow.tsx
│   │   ├── RatingModal.tsx
│   │   └── AvatarUpload.tsx
│   ├── pages/
│   │   ├── StartPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx       # OTP + تسجيل مباشر
│   │   ├── DashboardPage.tsx
│   │   ├── bookings/
│   │   ├── hotels/
│   │   ├── analytics/
│   │   ├── my-bookings/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── profile/
│   │   └── settings/
│   └── store/
│       ├── authStore.ts
│       ├── bookingsStore.ts
│       ├── notifEvents.ts
│       ├── supportChatStore.ts
│       └── ratingsStore.ts
└── .gitignore
```

---

## الميزات

### المصادقة
- تسجيل حساب جديد بـ OTP عبر Gmail / Yahoo / Outlook
- تسجيل مباشر بدون OTP للإيميلات الأخرى
- JWT للجلسات (صالح 7 أيام)

### الأدوار
| الدور | الصلاحيات |
|-------|-----------|
| `superadmin` | لوحة التحكم الكاملة، إدارة الحجوزات، الإشعارات، التحليلات |
| `support` | صندوق الدعم الفني فقط |
| `user` | حجز الفنادق، متابعة الحجوزات، الدعم الفني |

### إدارة الحجوزات
- دورة حياة كاملة: pending → accepted → paid → completed
- إشعار فوري للمستخدم عند كل قرار
- إرسال إيميل تأكيد HTML احترافي للمستخدمين (Gmail/Yahoo/Outlook)
- تصدير الحجوزات كـ CSV

### الإشعارات
- إشعارات real-time عبر HTTP polling كل 30 ثانية
- موجّهة لكل مستخدم حسب دوره

### الدعم الفني
- محادثات real-time بين المستخدمين وفريق الدعم
- Feedback system
- يعمل عبر أجهزة مختلفة

### تقييم الفنادق
- نجوم 1-5 + تعليق
- متاح للحجوزات المكتملة فقط

---

## تشغيل المشروع محلياً

### المتطلبات
- Node.js 18+
- حساب MongoDB Atlas
- Gmail App Password

### الباكاند
```bash
cd backend
npm install
cp .env.example .env
# عدّل .env بمعلوماتك
npm run dev
```

### الفرونتاند
```bash
npm install
npm start
```

---

## متغيرات البيئة (backend/.env)

```env
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_secret_key
OTP_EXPIRY_MINUTES=10
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM_NAME=نُزُل - Nuzul
MONGODB_URI=mongodb+srv://...
```

---

## النشر

- **الفرونتاند:** Vercel
- **الباكاند:** Railway
- **قاعدة البيانات:** MongoDB Atlas
