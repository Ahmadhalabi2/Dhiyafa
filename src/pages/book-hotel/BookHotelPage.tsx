import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useBookingsStore } from '../../store/bookingsStore';
import { useNotifEventsStore } from '../../store/notifEvents';
import { useHotelsStore } from '../../store/hotelsStore'; // استيراد المتجر الفعلي
import { SYRIA_COUNTRY_NAME, SYRIA_HOTELS } from '../../data/syria';


export default function BookHotelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { hotels } = useHotelsStore(); // جلب الفنادق من المتجر

  // دالة لتحويل ID الفندق إلى الرقمي الصحيح (من hotelsStore)
  // سواء كان الفندق من SYRIA_HOTELS (id نصي) أو من hotelsStore (id رقمي)
  const resolveNumericHotelId = useCallback((hotelName: string, hotelId: string | number): number => {
    // إذا كان الرقم صحيح أصلاً (من hotelsStore)، استخدمه مباشرة
    if (typeof hotelId === 'number') return hotelId;
    
    // محاولة إيجاد فندق مطابق في hotelsStore عن طريق الاسم
    const cleanName = hotelName.replace(/\([^)]*\)/g, '').trim();
    const match = hotels.find(h => 
      h.name.includes(cleanName.slice(0, 15)) || 
      cleanName.includes(h.name.replace(/\([^)]*\)/g, '').trim().slice(0, 10))
    );
    if (match) return match.id;
    
    // Fallback: خريطة ثابتة لربط المعرفات النصية بالرقمية
    const STATIC_MAP: Record<string, number> = {
      'hotel-dama-rose': 1,
      'hotel-four-seasons-dam': 1,
      'hotel-beit-al-wali': 3,
      'hotel-sheraton-dam': 4,
      'hotel-afamia-hama': 2,
      'hotel-afamia-resort-lat': 2,
      'hotel-shahba-aleppo': 0,
    };
    return STATIC_MAP[String(hotelId)] ?? 0;
  }, [hotels]);

  const findHotelInStore = (hid: string | undefined) => {
    if (!hid) return undefined;

    return hotels.find((h) => {
      if (!isNaN(Number(hid))) {
        return Number(h.id) === Number(hid);
      }


      const slug = hid.toLowerCase();
      return (
        (slug.includes('dama-rose') && h.name.includes('داما روز')) ||
        (slug.includes('afamia') && h.name.includes('أفاميا')) ||
        (slug.includes('wali') && h.name.includes('الوالي')) ||
        (slug.includes('sheraton') && h.name.includes('الشيراتون')) ||
        (slug.includes('mamlooka') && h.name.includes('المملوكة')) ||
        (slug.includes('shahba') && h.name.includes('شهباء')) ||
        (slug.includes('junada') && h.name.includes('جونادا')) ||
        h.id.toString() === hid
      );
    });
  };

  // fallback: إذا متجر الفنادق لا يحتوي نفس IDs التي تعرضها HotelsPage (SYRIA_HOTELS)
  const fallbackHotels = SYRIA_HOTELS.map((h) => ({
    ...h,
    status: 'active' as const,
    tag: 'فنادق سوريا',
    image: h.imageUrl,
    amenities: h.features,
    price: h.discountPrice ?? h.pricePerNight,
    rooms: 12,
    rating: h.rating,
    id: h.id,
    country: SYRIA_COUNTRY_NAME,
  }));

  const findHotelFallback = (hid: string | undefined) => {
    if (!hid) return undefined;
    const byNumeric = Number(hid);
    const slug = hid.toLowerCase();

    return fallbackHotels.find((h) => {
      if (!isNaN(byNumeric)) return Number(h.id) === byNumeric;



      return (
        (slug.includes('dama-rose') && h.name.includes('داما روز')) ||
        (slug.includes('afamia') && h.name.includes('أفاميا')) ||
        (slug.includes('wali') && h.name.includes('الوالي')) ||
        (slug.includes('sheraton') && h.name.includes('الشيراتون')) ||
        (slug.includes('mamlooka') && h.name.includes('المملوكة')) ||
        (slug.includes('shahba') && h.name.includes('شهباء')) ||
        (slug.includes('junada') && h.name.includes('جونادا')) ||
        h.id.toString() === hid
      );
    });
  };

  const hotel = findHotelInStore(id) || findHotelFallback(id);


  const [guestName, setGuestName] = useState(currentUser?.name ?? '');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const { createBooking } = useBookingsStore();
  const { addEvent } = useNotifEventsStore();

  const [step, setStep] = useState<'form' | 'summary' | 'confirmed_submit'>('form');
  const [, setLastBookingId] = useState<string | null>(null);


  // حساب عدد الليالي والإجمالي
  const nights = useMemo(
    () =>
      checkIn && checkOut
        ? Math.max(
            0,
            Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
          )
        : 0,
    [checkIn, checkOut]
  );

  const total = hotel ? nights * hotel.price * guests : 0;


  if (!hotel) return (

    <Layout>
      <p style={{ textAlign: 'center', color: '#93A29B', paddingTop: 80, fontFamily: "'Tajawal', sans-serif" }}>لم يتم العثور على الفندق.</p>
    </Layout>
  );

  const handleBookPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('يرجى تسجيل الدخول أولاً.');
    if (!checkIn || !checkOut || nights <= 0) return alert('يرجى اختيار تواريخ صحيحة.');

    setStep('summary');
  };

  const handleConfirmBooking = () => {
    if (!currentUser) return alert('يرجى تسجيل الدخول أولاً.');
    if (!checkIn || !checkOut || nights <= 0) return alert('يرجى اختيار تواريخ صحيحة.');

    // الحصول على ID رقمي صحيح للفندق (لتظهر الحجوزات عند المدير)
    const numericHotelId = resolveNumericHotelId(hotel.name, hotel.id);

    const b = createBooking({
      userId:    currentUser.id,
      userEmail: currentUser.email,
      userName:  guestName,
      hotelId: numericHotelId,
      hotelName: hotel.name,
      country: hotel.country || 'سوريا',
      city: hotel.city,
      checkIn,
      checkOut,
      guests,
      nights,
      amount: total,
    });

    addEvent({
      type: 'booking_created',
      bookingId: b.id,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
      targetRole: 'superadmin',
      title: 'طلب حجز جديد',
      desc: `قام ${currentUser.name} بحجز ${hotel.name} (${checkIn} → ${checkOut})`,
    });

    setLastBookingId(b.id);
    setStep('confirmed_submit');
  };


  if (step === 'summary') return (
    <Layout>
      <button style={S.back} onClick={() => setStep('form')}>
        <ArrowRight size={16} /> العودة إلى التفاصيل
      </button>

      <div style={S.summaryPage}>
        <div style={S.summaryCard}>
          <h2 style={S.summaryTitle}>تأكيد حجزك</h2>
          <p style={S.summaryHotelLine}>
            الفندق: <strong>{hotel.name}</strong>
          </p>

          <div style={S.summaryGrid}>
            <div style={S.summaryRowBox}>
              <span style={S.summaryLabel}>تسجيل الوصول</span>
              <span style={S.summaryValue}>{checkIn}</span>
            </div>
            <div style={S.summaryRowBox}>
              <span style={S.summaryLabel}>المغادرة</span>
              <span style={S.summaryValue}>{checkOut}</span>
            </div>
            <div style={S.summaryRowBox}>
              <span style={S.summaryLabel}>عدد الضيوف</span>
              <span style={S.summaryValue}>{guests}</span>
            </div>
            <div style={S.summaryRowBox}>
              <span style={S.summaryLabel}>عدد الليالي</span>
              <span style={S.summaryValue}>{nights}</span>
            </div>
          </div>

          <div style={S.summaryTotal}>
            <span>الإجمالي</span>
            <span style={{ color: '#0E5C4A', fontSize: 18, fontWeight: 900 }}>{total.toLocaleString()} ل.س</span>
          </div>

          <button style={S.btn} onClick={handleConfirmBooking}>
            احجز رحلتك الآن
          </button>
        </div>
      </div>
    </Layout>
  );

  if (step === 'confirmed_submit') return (
    <Layout>
      <div style={S.success}>
        <CheckCircle size={56} color="#0E5C4A" />
        <h2 style={S.successTitle}>تم إرسال الطلب ✅</h2>
        <p style={S.successSub}>
          حجزك في <strong>{hotel.name}</strong> الآن <strong>بانتظار موافقة الإدارة</strong>.
        </p>
        <p style={S.successSub}>{checkIn} → {checkOut} · {nights} ليالٍ · {guests} ضيف/ضيوف</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#1C2B27', margin: '12px 0 18px' }}>
          الإجمالي: {total.toLocaleString()} ل.س
        </p>
        <button style={S.btn} onClick={() => navigate('/my-bookings')}>
          عرض حجوزاتي
        </button>
      </div>
    </Layout>
  );


  return (
    <Layout>
      <button style={S.back} onClick={() => navigate('/home')}>
        <ArrowRight size={16} /> العودة إلى الرئيسية
      </button>
      <div style={S.layout}>
        {/* بطاقة معلومات الفندق */}
        <div style={S.infoCard}>

          <div style={S.imgWrap}>
            <img src={hotel.image} alt={hotel.name} style={S.img} />
            <span style={S.tag}>{hotel.tag}</span>
          </div>
          <div style={S.infoBody}>
            <h2 style={S.hotelName}>{hotel.name}</h2>
            <p style={S.loc}><MapPin size={13} /> {hotel.city}, {hotel.country}</p>
            <div style={S.ratingRow}>
              <Star size={14} fill="#C69A3A" stroke="#C69A3A" />
              <span style={{ fontWeight: 700 }}>{hotel.rating}</span>
              <span style={{ color: '#93A29B', fontSize: 12 }}>· ممتاز</span>
            </div>
            <div style={S.amenities}>
              {hotel.amenities.map((a) => (
                <span key={a} style={S.chip}><Wifi size={11} /> {a}</span>
              ))}
            </div>
            <div style={S.priceRow}>
              <span style={S.price}>{hotel.price.toLocaleString()} ل.س</span>
              <span style={{ color: '#93A29B', fontSize: 13 }}> / ليلة لكل ضيف</span>
            </div>
          </div>
        </div>

        {/* نموذج الحجز */}
<form style={S.form} onSubmit={handleBookPreview}>
          <h3 style={S.formTitle}>احجز إقامتك</h3>

          <label style={S.label}>اسم الضيف</label>
          <input
            style={S.input}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>تسجيل الوصول</label>
              <input 
                type="date" 
                style={S.input} 
                value={checkIn} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setCheckIn(e.target.value)} 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>المغادرة</label>
              <input 
                type="date" 
                style={S.input} 
                value={checkOut} 
                min={checkIn || new Date().toISOString().split('T')[0]} 
                onChange={(e) => setCheckOut(e.target.value)} 
                required 
              />
            </div>
          </div>

          <label style={S.label}>عدد الضيوف</label>
          <select
            style={S.input}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            aria-label="عدد الضيوف"
          >
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>{g} {g > 1 ? 'ضيوف' : 'ضيف'}</option>
            ))}
          </select>

          {nights > 0 && (
            <div style={S.summary}>
              <div style={S.summaryRow}>
                <span>السعر لليلة × {guests} ضيف/ضيوف</span>
                <span>{(hotel.price * guests).toLocaleString()} ل.س</span>
              </div>
              <div style={S.summaryRow}>
                <span>عدد الليالي</span>
                <span>{nights}</span>
              </div>
              <div style={{ ...S.summaryRow, fontWeight: 700, fontSize: 16, borderTop: '1px solid #E5DFC8', paddingTop: 10, marginTop: 4 }}>
                <span>الإجمالي</span>
                <span style={{ color: '#0E5C4A' }}>{total.toLocaleString()} ل.س</span>
              </div>
            </div>
          )}

          <button type="submit" style={S.btn}>تأكيد الحجز</button>
        </form>
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  back: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#52655F', fontSize: 13, fontWeight: 700, padding: 0, marginBottom: 20, fontFamily: "'Tajawal', sans-serif" },
  layout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, direction: 'rtl' },
  infoCard: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, overflow: 'hidden' },
  imgWrap: { position: 'relative', height: 200 },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tag: { position: 'absolute', top: 10, right: 10, background: '#0A4437', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontFamily: "'Tajawal', sans-serif" },
  infoBody: { padding: 20 },
  hotelName: { margin: '0 0 6px', fontSize: 19, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  loc: { margin: '0 0 10px', fontSize: 12, color: '#93A29B', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Tajawal', sans-serif" },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 },
  amenities: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  chip: { fontSize: 11, fontWeight: 600, color: '#0A4437', background: '#E1EEE7', padding: '3px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Tajawal', sans-serif" },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 20, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  form: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "'Tajawal', sans-serif" },
  formTitle: { margin: '0 0 4px', fontSize: 19, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  label: { fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: -6 },
  input: { padding: '10px 12px', border: '1.5px solid #E5DFC8', borderRadius: 8, fontSize: 14, color: '#1C2B27', outline: 'none', background: '#FAF6EC', boxSizing: 'border-box', width: '100%', fontFamily: "'Tajawal', sans-serif" },
  row: { display: 'flex', gap: 12 },
  summary: { background: '#FAF6EC', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151' },
  btn: { padding: '13px', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4, fontFamily: "'Tajawal', sans-serif" },
  success: { textAlign: 'center', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: "'Tajawal', sans-serif" },
  successTitle: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  successSub: { margin: 0, fontSize: 14, color: '#52655F' },

  summaryPage: { paddingTop: 20, display: 'flex', justifyContent: 'center', direction: 'rtl' },
  summaryCard: { width: 'min(720px, 100%)', background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, padding: 24, fontFamily: "'Tajawal', sans-serif" },
  summaryTitle: { margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  summaryHotelLine: { margin: '0 0 18px', fontSize: 13, color: '#475569' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  summaryRowBox: { background: '#FAF6EC', border: '1px solid #E5DFC8', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryLabel: { color: '#52655F', fontSize: 12, fontWeight: 700 },
  summaryValue: { color: '#1C2B27', fontSize: 14, fontWeight: 900 },
  summaryTotal: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5DFC8', fontSize: 14, color: '#475569' },
};