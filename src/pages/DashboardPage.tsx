import { useMemo } from 'react';
import {
  LayoutDashboard,
  Hotel,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

import { useAuthStore } from '../store/authStore';
import { useHotelsStore } from '../store/hotelsStore';
import { useBookingsStore } from '../store/bookingsStore';

const USDT_RATE_APPROX = 25000; // ل.س لكل 1$ (تقريبي فقط)

function lsToUsd(ls: number) {
  return ls / USDT_RATE_APPROX;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { users } = useAuthStore();
  const { hotels } = useHotelsStore();
  const { bookings } = useBookingsStore();

  const activeBookingsCount = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending_admin').length;
    const acceptedWaiting = bookings.filter((b) => b.status === 'accepted_waiting_payment').length;
    return pending + acceptedWaiting;
  }, [bookings]);

  const confirmedRevenueLs = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'paid_confirmed')
      .reduce((sum, b) => sum + b.amount, 0);
  }, [bookings]);

  const confirmedRevenueUsd = lsToUsd(confirmedRevenueLs);

  const activeUsersCount = useMemo(() => {
    // حسب المعطيات الحالية: عدّ المستخدمين ذوي role=user
    return users.filter((u) => u.role === 'user').length;
  }, [users]);

  const STATS = [
    {
      label: 'إجمالي الفنادق والمنتجعات',
      value: hotels.length.toLocaleString('ar-EG'),
      icon: <Hotel size={22} />,
      color: '#0E5C4A',
    },
    {
      label: 'الحجوزات النشطة الحالية',
      value: activeBookingsCount.toLocaleString('ar-EG'),
      icon: <CalendarCheck size={22} />,
      color: '#C69A3A',
    },
    {
      label: 'صافي الإيرادات والأرباح',
      value: `$${confirmedRevenueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      icon: <DollarSign size={22} />,
      color: '#BD5B3E',
    },
    {
      label: 'قاعدة العملاء المشتركين',
      value: activeUsersCount.toLocaleString('ar-EG'),
      icon: <Users size={22} />,
      color: '#6E8F86',
    },
  ];

  return (
    <Layout>
      <style>{`
        @keyframes dashboardEntrance {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(14, 92, 74, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(14, 92, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 92, 74, 0); }
        }

        .animate-fade {
          animation: dashboardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }

        .luxury-stat-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .luxury-stat-card:hover {
          transform: translateY(-6px) scale(1.01);
          background: #ffffff !important;
          border-color: rgba(14, 92, 74, 0.25) !important;
          box-shadow: 0 20px 40px rgba(28, 43, 39, 0.05), 0 1px 3px rgba(14, 92, 74, 0.06) !important;
        }

        .luxury-action-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .luxury-action-btn:hover {
          transform: translateY(-3px);
          background: #ffffff !important;
          color: #0A4437 !important;
          border-color: #0A4437 !important;
          box-shadow: 0 12px 25px rgba(10, 68, 55, 0.12) !important;
        }
        .luxury-action-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(198, 154, 58, 0.12), transparent);
          transition: all 0.6s ease;
        }
        .luxury-action-btn:hover::before {
          left: 100%;
        }

        .pulse-icon {
          animation: pulseGlow 3s infinite;
        }
      `}</style>

      <div style={S.wrap}>
        <div className="animate-fade" style={S.header}>
          <div className="pulse-icon" style={S.iconBox}>
            <LayoutDashboard size={24} color="#fff" />
          </div>
          <div style={S.headerText}>
            <h1 style={S.title}>لوحة تحكم المشرف العام</h1>
            <p style={S.sub}>نظرة شاملة على النظام — الأرقام مبنية على بيانات فعلية من الحجوزات والفنادق والمستخدمين</p>
          </div>
        </div>

        <div className="animate-fade stagger-1" style={S.grid}>
          {STATS.map((s) => (
            <div key={s.label} className="luxury-stat-card" style={S.card}>
              <div style={{ ...S.iconWrap, background: s.color + '12', color: s.color }}>{s.icon}</div>
              <div style={S.cardContent}>
                <p style={S.value}>{s.value}</p>
                <p style={S.label}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-fade stagger-2" style={S.quickRow}>
          <button className="luxury-action-btn" style={S.quickBtn} onClick={() => navigate('/analytics')}>
            <TrendingUp size={18} style={S.btnIcon} /> عرض التحليلات المتقدمة
          </button>
          <button className="luxury-action-btn" style={S.quickBtn} onClick={() => navigate('/revenue')}>
            <DollarSign size={18} style={S.btnIcon} /> إدارة وتتبع الإيرادات
          </button>
          <button className="luxury-action-btn" style={S.quickBtn} onClick={() => navigate('/hotels')}>
            <Hotel size={18} style={S.btnIcon} /> التحكم في المنشآت والفنادق
          </button>
        </div>
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    direction: 'rtl',
    padding: '20px 0',
    background: '#FAF6EC',
    minHeight: '80vh',
    fontFamily: "'Tajawal', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 36,
  },
  iconBox: {
    width: 56,
    height: 56,
    background: 'linear-gradient(135deg, #0E5C4A 0%, #0A4437 100%)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 8px 20px rgba(10, 68, 55, 0.25)',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
    color: '#1C2B27',
    letterSpacing: '-0.5px',
    fontFamily: "'Amiri', serif",
  },
  sub: {
    margin: 0,
    fontSize: 14,
    color: '#52655F',
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
    marginBottom: 36,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(229, 223, 200, 0.8)',
    borderRadius: 20,
    padding: '24px',
    display: 'flex',
    gap: 18,
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(28,43,39,0.02)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  value: {
    margin: 0,
    fontSize: 26,
    fontWeight: 900,
    color: '#1C2B27',
    lineHeight: 1,
  },
  label: {
    margin: 0,
    fontSize: 13,
    color: '#52655F',
    fontWeight: 600,
  },
  quickRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  quickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 24px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #E5DFC8',
    borderRadius: 14,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    color: '#52655F',
    boxShadow: '0 4px 10px rgba(28,43,39,0.02)',
    fontFamily: "'Tajawal', sans-serif",
  },
  btnIcon: {
    color: '#C69A3A',
  },
};

