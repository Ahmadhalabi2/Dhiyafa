import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Globe2, Building2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useHotelsStore } from '../../store/hotelsStore';
import { SYRIA_PROVINCES } from '../../data/syria';
import {
  PALETTE, buildDisplayHotels, useHotelBookingFlow,
  HotelDetailsModal, BookingFormModal, HotelCard,
  HotelBookingFlowStyles, themeStyles, type DisplayHotel,
} from '../../components/HotelBookingFlow';

export default function HotelsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { hotels: storeHotels } = useHotelsStore();
  const isStaff = currentUser?.role === 'superadmin';
  const isManager = false;
  const managerHotelIds: number[] = [];

  const [search, setSearch] = useState('');
  const [provinceId, setProvinceId] = useState('all');
  const [city, setCity] = useState('all');

  // نفس مصدر بيانات الفنادق المستخدم بصفحة "عرض الكل" (الرئيسية) — لضمان تطابق تدفق الحجز تماماً
  const allHotels: DisplayHotel[] = useMemo(() => buildDisplayHotels(), []);

  // فلترة الفنادق حسب صلاحية المدير — يظهر فقط الفنادق التابعة له
  const accessibleHotels: DisplayHotel[] = useMemo(() => {
    if (!isManager) return allHotels;
    // نبني مجموعة من أسماء الفنادق (بأول 20 حرف) للمقارنة
    const managerHotelNames = new Set(
      storeHotels
        .filter((h) => managerHotelIds.includes(h.id))
        .map((h) => h.name.replace(/\([^)]*\)/g, '').trim().slice(0, 20).toLowerCase())
    );
    return allHotels.filter((h) => {
      const cleanName = h.name.replace(/\([^)]*\)/g, '').trim().slice(0, 20).toLowerCase();
      return managerHotelNames.has(cleanName);
    });
  }, [isManager, allHotels, storeHotels, managerHotelIds]);

  const flow = useHotelBookingFlow();

  const filteredByProvince = provinceId === 'all'
    ? accessibleHotels
    : accessibleHotels.filter((h) => h.provinceId === provinceId);

  const filteredByCity = city === 'all'
    ? filteredByProvince
    : filteredByProvince.filter((h) => h.city === city);

  const filtered = filteredByCity.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
  );

  const availableCities = Array.from(new Set(filteredByProvince.map((h) => h.city)));

  return (
    <Layout>
      <HotelBookingFlowStyles />
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>{isStaff ? 'إدارة الفنادق' : 'تصفح الفنادق في سوريا'}</h1>
          <p style={S.pageSub}>
            {isManager
              ? `${accessibleHotels.length} فندق من فنادقك المسؤول عنها`
              : isStaff
              ? `${allHotels.length} منشأة نشطة في سوريا`
              : `${filtered.length} فندق متاح للحجز حالياً`}
          </p>
        </div>
        {isStaff && !isManager && (
          <button style={S.addBtn} onClick={() => alert('إضافة فندق جديد قريباً')}>
            <Plus size={16} /> إضافة فندق جديد
          </button>
        )}
      </div>

      {/* شريط الفلترة والبحث */}
      <div style={S.toolbar}>
        <div style={S.searchBox}>
          <Search size={15} color="#93A29B" />
          <input
            style={S.searchIn}
            placeholder="ابحث باسم الفندق أو المدينة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={S.countrySelectWrap}>
          <Globe2 size={15} color="#93A29B" />
          <select
            style={S.countrySelect}
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setCity('all');
            }}
          >
            <option value="all">كل المحافظات</option>
            {SYRIA_PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={S.countrySelectWrap}>
          <select
            style={S.countrySelect}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="all">كل المدن</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* عرض الفنادق — نفس كرت الفندق ونفس تدفق النافذة المنبثقة المستخدم بصفحة "عرض الكل" */}
      <div style={themeStyles.hotelsGrid}>
        {filtered.map((hotel) => (
          isStaff ? (
            <StaffHotelCard key={hotel.id} hotel={hotel} onView={() => flow.openDetails(hotel)} />
          ) : (
            <HotelCard key={hotel.id} hotel={hotel} onViewDetails={() => flow.openDetails(hotel)} />
          )
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={S.empty}>
          <p style={{ fontSize: 32 }}>🏨</p>
          <p style={{ color: '#52655F', fontWeight: 700 }}>لم نجد أي فنادق تطابق معايير البحث.</p>
        </div>
      )}

      {/* نفس النوافذ المنبثقة بالضبط المستخدمة بصفحة "عرض الكل": التفاصيل ← الحجز ← النجاح */}
      {flow.viewHotel && (
        <HotelDetailsModal hotel={flow.viewHotel} onClose={flow.closeDetails} onBook={() => flow.startBooking(flow.viewHotel!)} />
      )}
      {flow.bookingHotel && <BookingFormModal hotel={flow.bookingHotel} flow={flow} />}
      
    </Layout>
  );
}

// بطاقة إدارية للموظفين — تفتح نفس نافذة التفاصيل عند الضغط على "عرض"، وتحافظ على أزرار التعديل والحذف
function StaffHotelCard({ hotel, onView }: { hotel: DisplayHotel; onView: () => void }) {
  return (
    <div style={themeStyles.hotelCard}>
      <div style={themeStyles.hotelImageContainer}>
        <img src={hotel.image} alt={hotel.name} style={themeStyles.hotelImg} loading="lazy" />
        <span style={themeStyles.hotelTagBadge}>{'⭐'.repeat(Math.min(hotel.stars, 5))}</span>
      </div>
      <div style={{ padding: 20 }}>
        <p style={themeStyles.hotelCardName}>{hotel.name}</p>
        <p style={themeStyles.hotelCardLocation}>{hotel.city}، {hotel.provinceName}</p>
        <div style={themeStyles.hotelCardMetaRow}>
          <span style={themeStyles.hotelRatingContainer}>★ {hotel.rating}</span>
          <span style={themeStyles.hotelPriceContainer}>${hotel.price} <span style={themeStyles.currencyText}>/ليلة</span></span>
        </div>
        <div style={S.adminActionRow}>
          <button onClick={onView} style={S.btnAdminView}>عرض</button>
          <button onClick={() => alert(`تعديل ${hotel.name}`)} style={S.btnAdminEdit}><Edit2 size={14} /> تعديل</button>
          <button onClick={() => alert(`حذف ${hotel.name}؟`)} style={S.btnAdminDelete}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12, direction: 'rtl' },
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', 'Cairo', serif" },
  pageSub: { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  toolbar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', direction: 'rtl' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5DFC8', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 200 },
  searchIn: { background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#1C2B27', width: '100%', fontFamily: "'Tajawal', sans-serif" },
  countrySelectWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5DFC8', borderRadius: 8, padding: '8px 12px' },
  countrySelect: { background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#1C2B27', cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  empty: { textAlign: 'center', padding: '60px 0', direction: 'rtl', fontFamily: "'Tajawal', sans-serif" },
  adminActionRow: { display: 'flex', gap: 8, marginTop: 14, borderTop: `1px solid ${PALETTE.line}`, paddingTop: 12 },
  btnAdminView: { flex: 1, padding: '8px', background: PALETTE.page, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: PALETTE.ink600, cursor: 'pointer' },
  btnAdminEdit: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: PALETTE.page, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.ink600, cursor: 'pointer' },
  btnAdminDelete: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: '#fbeceb', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.pomegranate, cursor: 'pointer' },
};