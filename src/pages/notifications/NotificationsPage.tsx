import { useEffect } from 'react';
import { CalendarCheck, Star, AlertCircle, UserPlus, CheckCircle, Trash2, Bell } from 'lucide-react';
import Layout from '../../components/Layout';
import { useNotifEventsStore, type BookingEvent } from '../../store/notifEvents';

type IconKey = 'booking_created' | 'booking_accepted' | 'booking_cancelled' | 'booking_paid' | 'booking_deleted' | 'booking_completed' | 'booking_rated' | 'default';

const ICONS: Record<IconKey, { icon: React.ReactNode; bg: string; color: string }> = {
  booking_created:   { icon: <CalendarCheck size={16} />, bg: '#E1EEE7', color: '#0A4437' },
  booking_accepted:  { icon: <CheckCircle   size={16} />, bg: '#DFF3EC', color: '#0E5C4A' },
  booking_cancelled: { icon: <AlertCircle   size={16} />, bg: '#FAEAE2', color: '#BD5B3E' },
  booking_paid:      { icon: <CheckCircle   size={16} />, bg: '#F6EBCB', color: '#9C7825' },
  booking_deleted:   { icon: <Trash2        size={16} />, bg: '#FAEAE2', color: '#BD5B3E' },
  booking_completed: { icon: <Star          size={16} />, bg: '#E1EEE7', color: '#0A4437' },
  booking_rated:     { icon: <Star          size={16} />, bg: '#F6EBCB', color: '#9C7825' },
  default:           { icon: <Bell          size={16} />, bg: '#F3EEDD', color: '#52655F' },
};

function timeAgo(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

export default function NotificationsPage() {
  const { events, fetchEvents, markAllRead, markRead, dismiss, unreadCount } = useNotifEventsStore();

  // جلب عند فتح الصفحة
  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // تعليم كل الإشعارات مقروءة عند الفتح
  useEffect(() => {
    if (unreadCount > 0) markAllRead();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>الإشعارات</h1>
          <p style={S.sub}>{events.length} إشعار بالإجمالي</p>
        </div>
        {unreadCount > 0 && (
          <button style={S.markBtn} onClick={() => markAllRead()}>تعليم الكل كمقروء</button>
        )}
      </div>

      <div style={S.list}>
        {events.map((n: BookingEvent) => {
          const cfg = ICONS[(n.type as IconKey)] ?? ICONS.default;
          return (
            <div
              key={n.id}
              style={{ ...S.item, background: n.unread ? '#FAF9F2' : '#fff' }}
              onClick={() => markRead(n.id)}
            >
              <div style={{ ...S.iconWrap, background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={S.itemTitle}>
                  {n.title}
                  {n.unread && <span style={S.dot} />}
                </p>
                <p style={S.itemDesc}>{n.desc}</p>
                <p style={S.itemTime}>{timeAgo(n.time)}</p>
              </div>
              <button
                style={S.dismissBtn}
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                aria-label="حذف الإشعار"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}

        {events.length === 0 && (
          <p style={{ textAlign: 'center', color: '#93A29B', padding: '60px 0', fontFamily: "'Tajawal', sans-serif" }}>
            لا توجد إشعارات جديدة، أنت على اطّلاع تام! 🎉
          </p>
        )}
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, direction: 'rtl' },
  title:      { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  sub:        { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  markBtn:    { background: 'none', border: 'none', color: '#0E5C4A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  list:       { display: 'flex', flexDirection: 'column', gap: 10, direction: 'rtl' },
  item:       { display: 'flex', gap: 14, padding: '16px', border: '1px solid #E5DFC8', borderRadius: 14, cursor: 'pointer', alignItems: 'flex-start' },
  iconWrap:   { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemTitle:  { margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1C2B27', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Tajawal', sans-serif" },
  itemDesc:   { margin: '0 0 6px', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  itemTime:   { margin: 0, fontSize: 11, color: '#93A29B' },
  dot:        { width: 7, height: 7, borderRadius: '50%', background: '#C69A3A', display: 'inline-block', flexShrink: 0 },
  dismissBtn: { background: 'none', border: 'none', color: '#C7BFA0', cursor: 'pointer', padding: 6, flexShrink: 0 },
};
