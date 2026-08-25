import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Hotel, CalendarCheck, Users, BarChart3,
  Settings, Bell, LogOut, Menu, X, Globe, Search, User,
  ShieldCheck, BookOpenCheck, CalendarRange, MessagesSquare
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotifEventsStore } from '../store/notifEvents';
import { useBookingsStore } from '../store/bookingsStore';

interface Props { children: React.ReactNode; minimal?: boolean; }

interface NavEntry { label: string; icon: typeof Hotel; path: string; badge?: number; }

export default function Layout({ children, minimal = false }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { unreadCount: notifUnread, fetchEvents } = useNotifEventsStore();

  // polling كل 30 ثانية لتحديث الـ badge
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const unreadCount = notifUnread;

  // العدد الفعلي للحجوزات الواصلة من المستخدمين وبانتظار موافقة الإدارة (مش رقم ثابت)
  const pendingBookingsCount = useBookingsStore(
    (s) => s.bookings.filter((b: any) => b.status === 'pending_admin').length
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const role = currentUser?.role as string;
  const isCustomer = role !== 'superadmin' && role !== 'support';

  let NAV: NavEntry[];
  if (role === 'superadmin') {
    NAV = [
      { label: 'لوحة التحكم',   icon: LayoutDashboard, path: '/dashboard' },
      { label: 'الفنادق',       icon: Hotel,           path: '/hotels' },
      { label: 'الحجوزات',      icon: CalendarCheck,   path: '/bookings', badge: pendingBookingsCount },
      { label: 'العملاء',       icon: Users,           path: '/customers' },
      { label: 'المستخدمين',    icon: ShieldCheck,     path: '/users' },
      { label: 'التحليلات',     icon: BarChart3,       path: '/analytics' },
      { label: 'الدعم الفني',   icon: MessagesSquare,  path: '/support' },
      { label: 'الإعدادات',     icon: Settings,        path: '/settings' },
    ];
  } else if (role === 'support') {
    NAV = [
      { label: 'صندوق الدعم',   icon: MessagesSquare,  path: '/support' },
      { label: 'الإعدادات',     icon: Settings,        path: '/settings' },
    ];
  } else {
    NAV = [
      { label: 'استعراض الفنادق', icon: Hotel,          path: '/hotels' },
      { label: 'حجوزاتي',        icon: BookOpenCheck,  path: '/my-bookings' },
      { label: 'الدعم الفني',    icon: MessagesSquare,  path: '/support' },
      { label: 'الإعدادات',      icon: Settings,       path: '/settings' },
    ];
  }

  const go = (path: string) => { setSidebarOpen(false); navigate(path); };
  const closeSidebar = () => setSidebarOpen(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      const match = NAV.find((n) => n.label.toLowerCase().includes(search.toLowerCase()));
      if (match) { go(match.path); setSearch(''); }
    }
  };

  const initials   = currentUser?.name?.slice(0, 2).toUpperCase() || 'U';
  const avatarUrl  = useAuthStore((s) => s.getAvatarUrl());

  // تحديد مسمى رتبة المستخدم بالعربية للعرض في الأسفل
  const getRoleLabel = (r: string) => {
    if (r === 'superadmin') return 'مدير النظام الرئيسي';
    if (r === 'support')    return 'موظف الدعم';
    return 'عميل';
  };

  return (
    <div style={{ ...S.shell, direction: 'rtl' }}>

      {/* ── نظام الألوان والخطوط الموحّد لكامل المنصّة (ضِيافة) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800;900&display=swap');

        :root {
          --color-bg: #FAF6EC;
          --color-surface: #FFFFFF;
          --color-surface-alt: #F3EEDD;
          --color-ink: #1C2B27;
          --color-ink-soft: #52655F;
          --color-muted: #93A29B;
          --color-primary: #0E5C4A;
          --color-primary-dark: #0A4437;
          --color-primary-soft: #E1EEE7;
          --color-accent: #C69A3A;
          --color-accent-dark: #9C7825;
          --color-accent-soft: #F6EBCB;
          --color-terracotta: #BD5B3E;
          --color-terracotta-soft: #FAEAE2;
          --color-border: #E5DFC8;
          --font-display: 'Amiri', 'Cairo', serif;
          --font-body: 'Tajawal', 'Cairo', sans-serif;
        }

        body { background: var(--color-bg); font-family: var(--font-body); }

        .nav-icon-wrap { position: relative; }
        .nav-icon-wrap:hover .tooltip-lux {
          opacity: 1 !important;
          transform: translateY(0) translateX(50%) !important;
          pointer-events: auto !important;
        }
      `}</style>

      {/* ── SIDEBAR (يدعم الحركة من اليمين لتناسب الـ RTL) ── */}
      {!minimal && (
      <aside style={{ ...S.sidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)' }}
        aria-label="Sidebar navigation" aria-hidden={!sidebarOpen}>
        <div style={S.sidebarTop}>
          <button style={S.logoWrap} onClick={() => go('/home')}>
            <div style={S.logoMark}><Globe size={18} color="#fff" /></div>
            <span style={S.logoText}>ضِيافة</span>
          </button>
          <button style={S.closeBtn} onClick={closeSidebar} aria-label="إغلاق القائمة">
            <X size={18} />
          </button>
        </div>

        <nav style={S.nav} aria-label="التنقل الرئيسي">
          {NAV.map(({ label, icon: Icon, path, badge }) => {
            const active = pathname === path || (path !== '/home' && pathname.startsWith(path));
            return (
              <button key={path} style={{ ...S.navItem, ...(active ? S.navActive : {}) }}
                onClick={() => go(path)} aria-current={active ? 'page' : undefined}>
                <Icon size={18} />
                <span style={{ flex: 1 }}>{label}</span>
                {!!badge && <span style={S.badge}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        <div style={S.sidebarBot}>
          <button style={S.userBtn} onClick={() => go('/profile')}>
            <div style={S.miniAvatar}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
              <p style={S.uName}>{currentUser?.name}</p>
              <p style={S.uRole}>{getRoleLabel(role)}</p>
            </div>
            <User size={14} color="#93A29B" />
          </button>
          <button style={S.logoutBtn} onClick={() => { logout(); navigate('/login', { replace: true }); }}>
            <LogOut size={15} style={{ transform: 'rotate(180deg)' }} /> تسجيل الخروج
          </button>
        </div>
      </aside>
      )}

      {!minimal && sidebarOpen && <div style={S.overlay} onClick={closeSidebar} aria-hidden />}

      {/* ── MAIN ── */}
      <div style={S.mainWrap}>
        <header style={{ ...S.topbar, ...(minimal ? { justifyContent: 'flex-start' } : {}) }}>
          {minimal ? (
            <button style={S.desktopLogo} onClick={() => go('/home')}>
              <div style={{ ...S.logoMark, width: 28, height: 28 }}><Globe size={14} color="#fff" /></div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>ضِيافة</span>
            </button>
          ) : (
          <>
          <div style={S.topLeft}>
            <button style={S.iconBtn} onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة">
              <Menu size={20} />
            </button>
            <button style={S.desktopLogo} onClick={() => go('/home')}>
              <div style={{ ...S.logoMark, width: 28, height: 28 }}><Globe size={14} color="#fff" /></div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>ضِيافة</span>
            </button>
            <div style={S.searchBox}>
              <Search size={15} color="var(--color-muted)" />
              <input style={S.searchIn}
                placeholder="ابحث هنا… (اضغط Enter)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                aria-label="بحث في الصفحات" />
            </div>
          </div>

          <div style={S.topRight}>
            {/* إظهار أيقونة "حجوزاتي" فقط إذا كان العميل مسجلاً للدخول، وتختفي تلقائياً عند الإدارة والدعم ومزود الخدمة */}
            {isCustomer && (
              <div className="nav-icon-wrap" style={{ display: 'flex', alignItems: 'center' }}>
                <button style={S.iconBtn} onClick={() => go('/my-bookings')} aria-label="حجوزاتي">
                  <CalendarRange size={20} />
                </button>

                <div className="tooltip-lux" style={S.tooltip}>
                  <p style={S.tooltipTitle}>حجوزاتي</p>
                  <p style={S.tooltipSub}>استعرض، تتبع، أو عدّل وثائق حجزك الحالية والمستقبلية</p>
                  <div style={S.tooltipArrow} />
                </div>
              </div>
            )}

            <button style={S.iconBtn} onClick={() => go('/notifications')} aria-label={`الإشعارات، ${unreadCount} غير مقروءة`}>
              <Bell size={20} />
              {unreadCount > 0 && <span style={S.notifBadge}>{unreadCount}</span>}
            </button>

            <button style={S.avatarBtn} onClick={() => go('/profile')} aria-label="ملفك الشخصي" title={currentUser?.name}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials}
            </button>
          </div>
          </>
          )}
        </header>

        <main style={S.page}>{children}</main>
      </div>
    </div>
  );
}

// ── Styles Sheet ────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' },

  sidebar: { position: 'fixed', top: 0, right: 0, height: '100vh', width: 240, background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', zIndex: 200, transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)' },
  sidebarTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 14px 14px', borderBottom: '1px solid var(--color-border)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  logoMark: { width: 32, height: 32, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontWeight: 700, fontSize: 17, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' },

  nav: { flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-soft)', fontSize: 14, fontWeight: 500, width: '100%', textAlign: 'right', transition: 'background 0.12s', fontFamily: 'var(--font-body)' },
  navActive: { background: 'var(--color-primary-soft)', color: 'var(--color-primary-dark)', fontWeight: 700 },
  badge: { background: 'var(--color-accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20 },

  sidebarBot: { padding: '10px 8px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 6 },
  userBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', width: '100%' },
  miniAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  uName: { margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  uRole: { margin: 0, fontSize: 11, color: 'var(--color-muted)' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'none', border: '1px solid var(--color-terracotta-soft)', color: 'var(--color-terracotta)', cursor: 'pointer', fontSize: 13, fontWeight: 600, justifyContent: 'center' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(28,43,39,0.4)', zIndex: 199, backdropFilter: 'blur(2px)' },

  mainWrap: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 },
  topbar: { position: 'sticky', top: 0, height: 60, background: 'rgba(250,246,236,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100, gap: 12 },
  topLeft: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  desktopLogo: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, flexShrink: 0 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-alt)', borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 280 },
  searchIn: { background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--color-ink)', width: '100%', textAlign: 'right', fontFamily: 'var(--font-body)' },
  topRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-soft)', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: 'var(--color-terracotta)', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarBtn: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  page: { flex: 1, padding: '32px 28px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' },

  tooltip: {
    position: 'absolute',
    bottom: '-84px',
    right: '50%',
    transform: 'translateY(-6px) translateX(50%)',
    background: 'var(--color-primary-dark)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 12,
    boxShadow: '0 10px 25px rgba(10,68,55,0.25)',
    width: '240px',
    textAlign: 'right',
    direction: 'rtl',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 999,
  },
  tooltipTitle: { margin: '0 0 3px', fontSize: 13, fontWeight: 800, color: '#fff' },
  tooltipSub: { margin: 0, fontSize: 11, color: 'var(--color-accent-soft)', fontWeight: 500, lineHeight: 1.4 },
  tooltipArrow: {
    position: 'absolute',
    top: '-4px',
    right: '50%',
    transform: 'translateX(50%) rotate(45deg)',
    width: 8,
    height: 8,
    background: 'var(--color-primary-dark)',
  }
};
