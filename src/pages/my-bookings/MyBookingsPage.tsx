import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, MapPin, Clock, CheckCircle, XCircle, Plus, CreditCard, AlertCircle, Star } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useBookingsStore } from '../../store/bookingsStore';
import { useNotifEventsStore } from '../../store/notifEvents';
import { useRatingsStore } from '../../store/ratingsStore';
import RatingModal from '../../components/RatingModal';
import type { Booking } from '../../store/bookingsStore';

const STATUS: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending_admin:    { label: 'في انتظار موافقة الإدارة', bg: '#FAEAE2', text: '#BD5B3E', icon: <Clock size={13} /> },
  accepted_waiting_payment: { label: 'مقبول - في انتظار الدفع', bg: '#E1EEE7', text: '#0A4437', icon: <CreditCard size={13} /> },
  paid_confirmed:   { label: 'مؤكد ومدفوع ✨', bg: '#E1EEE7', text: '#0A4437', icon: <CheckCircle size={13} /> },
  completed:        { label: 'مكتمل', bg: '#E6F7F1', text: '#0D6B4B', icon: <CheckCircle size={13} /> },
  cancelled_by_admin:   { label: 'ملغي من الإدارة', bg: '#FAEAE2', text: '#BD5B3E', icon: <XCircle size={13} /> },
  cancelled_by_user:    { label: 'ملغي من قبلك',    bg: '#F1F1EC', text: '#6E7C76', icon: <XCircle size={13} /> },
};

const DEFAULT_STATUS = { label: 'محدث', bg: '#F3EEDD', text: '#52655F', icon: <AlertCircle size={13} /> };

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState('all');
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);

  const { bookings, cancelByUser } = useBookingsStore();
  const { addEvent }  = useNotifEventsStore();
  const { hasRated, getRatingForBooking } = useRatingsStore();

  // جلب حجوزات المستخدم الحالي فقط
  const mine = bookings.filter((b) => b.userId === currentUser?.id);
  
  // دوال مساعدة للتصنيف
  const isPendingStatus = (s: string) => s === 'pending_admin' || s === 'accepted_waiting_payment';
  const isConfirmedStatus = (s: string) => s === 'paid_confirmed';
  const isCompletedStatus = (s: string) => s === 'completed';
  const isCancelledStatus = (s: string) => s === 'cancelled_by_admin' || s === 'cancelled_by_user';

  // الفلترة الشاملة حسب كل تبويب
  const filtered = mine.filter((b) => {
    const s = b.status;

    if (tab === 'all') return true;
    if (tab === 'pending') return isPendingStatus(s);
    if (tab === 'confirmed') return isConfirmedStatus(s);
    if (tab === 'completed') return isCompletedStatus(s);
    if (tab === 'cancelled') return isCancelledStatus(s);

    return s === tab;
  });

  // معالجة إلغاء الحجز مع تفعيل نظام الإشعارات التلقائي
  const handleCancelBooking = (bookingId: string, hotelName: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في إلغاء حجزك في "${hotelName}"؟`)) {
      const res = cancelByUser(bookingId);
      if (res.success) {
        addEvent({
          bookingId: bookingId,
          createdByUserId: currentUser?.id || '',
          createdByName: currentUser?.name || 'مستخدم',
          targetRole: 'superadmin',
          type: 'booking_cancelled',
          title: 'تم إلغاء طلب حجز',
          desc: `لقد قام المستخدم بإلغاء طلب الحجز لـ ${hotelName} بنجاح.`,
        });
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <>
    <Layout>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(16px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .booking-card-lux {
          animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .booking-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(14, 92, 74, 0.08) !important;
          border-color: rgba(14, 92, 74, 0.25) !important;
        }
        .tab-btn-lux { transition: all 0.25s ease; }
        .tab-btn-lux:hover { color: #0E5C4A !important; }
        
        .tabs-container-lux {
          display: flex;
          gap: 8px;
          margin-bottom: 28px;
          border-bottom: 1px solid #E5DFC8;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .tabs-container-lux::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 640px) {
          .meta-row-lux {
            flex-direction: column;
          }
          .meta-divider-lux {
            width: 100% !important;
            height: 1px !important;
          }
        }
      `}</style>

      <div style={S.wrap}>
        {/* هيدر الصفحة */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>سجلات حجوزاتي</h1>
            <p style={S.sub}>مرحباً بك مجدداً، {currentUser?.name?.split(' ')[0]}! تتوفر في حسابك الحالي {mine.length} إقامات محجوزة.</p>
          </div>
          <button className="tab-btn-lux" style={S.newBtn} onClick={() => navigate('/hotels')}>
            <Plus size={16} /> حجز إقامة جديدة
          </button>
        </div>

        {/* التبويبات الفاخرة المحدثة */}
        <div className="tabs-container-lux">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'قيد المراجعة والانتظار' },
            { id: 'confirmed', label: 'المؤكدة' },
            { id: 'completed', label: 'المكتملة' },
            { id: 'cancelled', label: 'الملغية' }
          ].map((t) => {
            const count = t.id === 'all' ? mine.length : mine.filter((b) => {
              const s = b.status;
              if (t.id === 'pending') return isPendingStatus(s);
              if (t.id === 'confirmed') return isConfirmedStatus(s);
              if (t.id === 'completed') return isCompletedStatus(s);
              if (t.id === 'cancelled') return isCancelledStatus(s);
              return s === t.id;
            }).length;

            return (
              <button key={t.id} className="tab-btn-lux" style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }} onClick={() => setTab(t.id)}>
                {t.label}
                <span style={{ ...S.tabCount, ...(tab === t.id ? S.tabCountActive : {}) }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* قائمة الكروت */}
        <div style={S.list}>
          {filtered.map((b) => {
            const st = STATUS[b.status as string] || DEFAULT_STATUS;
            
            // تحديد من قام بالإجراء (قبول/إلغاء)
            const getDecisionInfo = () => {
              if (!b.decidedByName) return null;
              return { roleLabel: 'الإدارة', name: b.decidedByName || '' };
            };
            const decisionInfo = getDecisionInfo();

            return (
              <div key={b.id} className="booking-card-lux" style={S.card}>
                <div style={{ ...S.sideIndicator, background: st.text }} />
                
                <div style={S.info}>
                  <div style={S.topRow}>
                    <div>
                      <p style={S.hotelName}>{b.hotelName}</p>
                      <p style={S.loc}><MapPin size={13} style={{ marginLeft: 3 }} /> {b.city}</p>
                    </div>
                    <span style={{ ...S.pill, background: st.bg, color: st.text }}>
                      {st.icon} <span style={{ marginRight: 4 }}>{st.label}</span>
                    </span>
                  </div>

                  {/* عرض سبب الإلغاء ومن قام به */}
                  {(b.status.startsWith('cancelled') || b.status === 'paid_confirmed' || b.status === 'completed') && (b.reason || decisionInfo) && (
                    <div style={{ background: '#fff', border: '1px solid #FAEAE2', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginTop: -6 }}>
                      {b.reason && (
                        <p style={{ margin: '0 0 4px', color: '#BD5B3E', fontWeight: 600 }}>
                          سبب الإلغاء: {b.reason}
                        </p>
                      )}
                      {decisionInfo && (
                        <p style={{ margin: 0, color: '#52655F', fontWeight: 500 }}>
                          تم بواسطة: {decisionInfo.roleLabel}{decisionInfo.name ? ` (${decisionInfo.name})` : ''}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="meta-row-lux" style={S.metaRow}>
                    <div style={S.metaItem}>
                      <p style={S.metaLabel}>تسجيل الوصول</p>
                      <p style={S.metaVal}>{b.checkIn}</p>
                    </div>
                    <div className="meta-divider-lux" style={S.metaDivider} />
                    <div style={S.metaItem}>
                      <p style={S.metaLabel}>المغادرة</p>
                      <p style={S.metaVal}>{b.checkOut}</p>
                    </div>
                    <div className="meta-divider-lux" style={S.metaDivider} />
                    <div style={S.metaItem}>
                      <p style={S.metaLabel}>عدد الليالي</p>
                      <p style={S.metaVal}>{b.nights} ليالٍ</p>
                    </div>
                    <div className="meta-divider-lux" style={S.metaDivider} />
                    <div style={S.metaItem}>
                      <p style={S.metaLabel}>الإجمالي الكلي</p>
                      <p style={{ ...S.metaVal, color: '#0E5C4A', fontWeight: 900 }}>${b.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={S.actions}>
                    <span style={{ fontSize: 12, color: '#93A29B', fontWeight: 500 }}>رقم المرجع الفني: <code style={{ color: '#52655F' }}>{b.id}</code></span>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                      {isPendingStatus(b.status) && (
                        <button
                          style={S.cancelBtn}
                          onClick={() => handleCancelBooking(b.id, b.hotelName)}
                        >
                          إلغاء طلب الحجز
                        </button>
                      )}
                      {(isConfirmedStatus(b.status) || isCompletedStatus(b.status)) && (
                        <button
                          style={{ ...S.reviewBtn, background: hasRated(b.id) ? '#E1EEE7' : '#F6EBCB', color: hasRated(b.id) ? '#0A4437' : '#9C7825' }}
                          onClick={() => setRatingBooking(b)}
                        >
                          <Star size={13} fill={hasRated(b.id) ? '#C69A3A' : 'none'} stroke="#C69A3A" />
                          {hasRated(b.id)
                            ? `تقييمك: ${getRatingForBooking(b.id)?.stars ?? 0}/5`
                            : 'إضافة تقييم للإقامة'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* في حال عدم وجود نتائج */}
          {filtered.length === 0 && (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <CalendarCheck size={36} color="#0E5C4A" />
              </div>
              <p style={{ color: '#1C2B27', margin: '14px 0 4px', fontSize: 16, fontWeight: 700 }}>لا توجد حجوزات مدرجة</p>
              <p style={{ color: '#52655F', margin: '0 0 16px', fontSize: 13, fontWeight: 500 }}>لم تقم بإجراء أي عمليات حجز تندرج تحت هذا التصنيف حتى الآن.</p>
              <button style={S.newBtn} onClick={() => navigate('/hotels')}>استكشف الفنادق المتاحة</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
      {ratingBooking && (
        <RatingModal booking={ratingBooking} onClose={() => setRatingBooking(null)} />
      )}
    </>
  );
}

// ─────────────────────── STYLES (Premium RTL Customizations) ──────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  wrap: { direction: 'rtl', padding: '10px 0', fontFamily: "'Tajawal', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  title: { margin: 0, fontSize: 30, fontWeight: 700, color: '#1C2B27', letterSpacing: '-0.5px', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 0', fontSize: 14, color: '#52655F', fontWeight: 500 },
  newBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,92,74,0.25)' },
  tab: { padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#52655F', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '3px solid transparent', marginBottom: -2, flexShrink: 0 },
  tabActive: { color: '#0E5C4A', borderBottomColor: '#0E5C4A', fontWeight: 800 },
  tabCount: { background: '#F3EEDD', color: '#52655F', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginRight: 4 },
  tabCountActive: { background: '#E1EEE7', color: '#0A4437' },
  list: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 20, overflow: 'hidden', display: 'flex', boxShadow: '0 4px 10px rgba(28,43,39,0.02)' },
  sideIndicator: { width: 6, flexShrink: 0 },
  info: { flex: 1, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  hotelName: { margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1C2B27' },
  loc: { margin: 0, fontSize: 13, color: '#93A29B', display: 'flex', alignItems: 'center', fontWeight: 500 },
  pill: { display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0 },
  metaRow: { display: 'flex', background: '#FAF6EC', borderRadius: 14, border: '1px solid #F3EEDD', overflow: 'hidden', flexWrap: 'wrap' },
  metaItem: { flex: 1, padding: '12px 16px', minWidth: 100, textAlign: 'right' },
  metaDivider: { width: 1, background: '#E5DFC8' },
  metaLabel: { margin: '0 0 4px', fontSize: 11, color: '#93A29B', fontWeight: 700 },
  metaVal: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1C2B27' },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 12 },
  cancelBtn: { padding: '9px 16px', background: '#FAEAE2', color: '#BD5B3E', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  reviewBtn: { padding: '9px 16px', background: '#F6EBCB', color: '#9C7825', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  empty: { textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', border: '1px solid #E5DFC8', borderRadius: 24 },
  emptyIconWrap: { width: 64, height: 64, background: '#E1EEE7', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

