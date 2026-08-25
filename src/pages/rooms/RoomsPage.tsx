import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, TrendingUp, CreditCard, Wallet, Download, Percent } from 'lucide-react';
import Layout from '../../components/Layout';
import { useBookingsStore } from '../../store/bookingsStore';
import { SYP_RATE } from '../../components/HotelBookingFlow';

const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const COMMISSION = 0.12; // 12% عمولة المنصة

export default function RoomsPage() {
  const { bookings } = useBookingsStore();

  // ── آخر 6 أشهر (بالـ SYP) ────────────────────────────────────────────────
  const revenueTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const y     = d.getFullYear();
      const m     = d.getMonth();
      const total = bookings
        .filter((b) => {
          const bd = new Date(b.paidAt ?? b.createdAt);
          return bd.getFullYear() === y && bd.getMonth() === m
            && (b.status === 'paid_confirmed' || b.status === 'completed');
        })
        .reduce((s, b) => s + b.amount, 0);
      // تحويل لملايين الليرة السورية
      return { month: AR_MONTHS[m], revenue: Math.round((total * SYP_RATE) / 1_000_000) };
    });
  }, [bookings]);

  // ── مستحقات الفنادق (فنادق لها حجوزات مدفوعة أو مكتملة) ─────────────────
  const payouts = useMemo(() => {
    const map = new Map<string, { amount: number; status: 'paid' | 'pending' }>();
    bookings
      .filter((b) => b.status === 'paid_confirmed' || b.status === 'completed')
      .forEach((b) => {
        const net = b.amount * (1 - COMMISSION); // بعد خصم العمولة
        const cur = map.get(b.hotelName);
        map.set(b.hotelName, {
          amount: (cur?.amount ?? 0) + net,
          status: b.status === 'completed' ? 'paid' : 'pending',
        });
      });
    return [...map.entries()].slice(0, 8).map(([hotel, { amount, status }], i) => ({
      id:      `SY-PO-${2600 + i + 1}`,
      hotel,
      period:  `${AR_MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`,
      amountSyp: Math.round(amount * SYP_RATE).toLocaleString('en-US'),
      status,
    }));
  }, [bookings]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear  = new Date().getFullYear();

    const monthRevUSD = bookings
      .filter((b) => {
        const d = new Date(b.paidAt ?? b.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
          && (b.status === 'paid_confirmed' || b.status === 'completed');
      })
      .reduce((s, b) => s + b.amount, 0);

    const pendingUSD = bookings
      .filter((b) => b.status === 'accepted_waiting_payment')
      .reduce((s, b) => s + b.amount, 0);

    const prevMonthRevUSD = bookings
      .filter((b) => {
        const d = new Date(b.paidAt ?? b.createdAt);
        const prev = new Date(currentYear, currentMonth - 1, 1);
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
          && (b.status === 'paid_confirmed' || b.status === 'completed');
      })
      .reduce((s, b) => s + b.amount, 0);

    const growth = prevMonthRevUSD
      ? (((monthRevUSD - prevMonthRevUSD) / prevMonthRevUSD) * 100).toFixed(1)
      : '—';

    return [
      { icon: <Landmark size={20} />, label: 'إيرادات الشهر الحالي', value: `${Math.round(monthRevUSD * SYP_RATE / 1_000_000).toLocaleString()} م.ل.س`, subValue: `ما يعادل $${monthRevUSD.toLocaleString()} تقريباً`, color: '#0E5C4A' },
      { icon: <TrendingUp size={20} />, label: 'النمو مقارنة بالشهر الماضي', value: growth === '—' ? '—' : `${Number(growth) >= 0 ? '+' : ''}${growth}%`, subValue: 'مقارنة بالشهر السابق', color: '#C69A3A' },
      { icon: <CreditCard size={20} />, label: 'مستحقات بانتظار الدفع', value: `${Math.round(pendingUSD * SYP_RATE / 1_000_000).toLocaleString()} م.ل.س`, subValue: 'بانتظار التسوية البنكية', color: '#BD5B3E' },
      { icon: <Wallet size={20} />, label: 'عمولة المنصة', value: `${(COMMISSION * 100).toFixed(0)}%`, subValue: 'رسوم حجز ومعالجة ثابتة', color: '#6E8F86' },
    ];
  }, [bookings]);

  const hasData = bookings.some((b) => b.status === 'paid_confirmed' || b.status === 'completed');

  return (
    <Layout>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .revenue-card-lux { animation: fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; transition: all 0.3s !important; }
        .revenue-card-lux:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(14,92,74,0.06) !important; }
        .btn-hover-lux { transition: all 0.2s ease; }
        .btn-hover-lux:hover { opacity:0.9; transform:scale(0.98); }
        @media(max-width:640px) { .rev-header-lux{flex-direction:column;align-items:flex-start!important;gap:16px} .export-btn-lux{width:100%;justify-content:center} }
      `}</style>

      <div style={S.wrap}>
        <div className="rev-header-lux" style={S.header}>
          <div>
            <h1 style={S.title}>المالية والإيرادات الفندقية</h1>
            <p style={S.sub}>
              {hasData
                ? 'نظرة عامة على الإيرادات والمستحقات بناءً على الحجوزات الفعلية'
                : 'لا توجد بيانات مالية بعد — ستظهر بعد أول حجز مدفوع'}
            </p>
          </div>
          <button
            className="btn-hover-lux export-btn-lux"
            style={S.exportBtn}
            onClick={() => {
              const rows = [['ID','الفندق','الفترة','المبلغ (م.ل.س)','الحالة'],
                ...payouts.map((p) => [p.id, p.hotel, p.period, p.amountSyp, p.status === 'paid' ? 'مدفوع' : 'قيد المعالجة'])];
              const csv  = rows.map((r) => r.join(',')).join('\n');
              const a    = document.createElement('a');
              a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
              a.download = 'payouts.csv';
              a.click();
            }}
          >
            <Download size={15} /> تصدير التقرير
          </button>
        </div>

        {/* KPIs */}
        <div style={S.kpiGrid}>
          {kpis.map((k) => (
            <div key={k.label} className="revenue-card-lux" style={S.kpiCard}>
              <div style={{ ...S.kpiIcon, background: k.color + '1a', color: k.color }}>{k.icon}</div>
              <div>
                <p style={S.kpiValue}>{k.value}</p>
                <p style={S.kpiLabel}>{k.label}</p>
                <p style={S.kpiSubValue}>{k.subValue}</p>
              </div>
            </div>
          ))}
        </div>

        {/* منحنى الإيرادات */}
        <div className="revenue-card-lux" style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <p style={S.cardTitle}>تحليل اتجاه الإيرادات — آخر 6 أشهر (م.ل.س)</p>
            <span style={{ fontSize: 11, color: '#52655F', background: '#F3EEDD', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>* بالملايين</span>
          </div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0E5C4A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0E5C4A" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3EEDD" vertical={false} />
                <XAxis dataKey="month" stroke="#93A29B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#93A29B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}م`} />
                <Tooltip formatter={(v: number) => [`${v} مليون ل.س`, 'الإيرادات']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5DFC8', fontSize: 13, fontFamily: "'Tajawal',sans-serif", direction: 'rtl' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0E5C4A" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93A29B', fontSize: 13, fontFamily: "'Tajawal',sans-serif" }}>
              لا توجد بيانات مالية بعد
            </div>
          )}
        </div>

        {/* جدول المستحقات */}
        <div className="revenue-card-lux" style={S.card}>
          <p style={{ ...S.cardTitle, marginBottom: 16 }}>مستحقات الفنادق الشريكة</p>
          {payouts.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #F3EEDD' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['معرّف الدفعة','الفندق','الفترة','المبلغ الصافي (ل.س)','الحالة','إجراء'].map((h) => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} style={S.tr}>
                      <td style={{ ...S.td, fontWeight: 700, color: '#0E5C4A' }}>{p.id}</td>
                      <td style={{ ...S.td, fontWeight: 800, color: '#1C2B27' }}>{p.hotel}</td>
                      <td style={{ ...S.td, color: '#52655F' }}>{p.period}</td>
                      <td style={{ ...S.td, fontWeight: 800 }}>{p.amountSyp} ل.س</td>
                      <td style={S.td}>
                        <span style={{ ...S.pill, background: p.status === 'paid' ? '#E1EEE7' : '#F6EBCB', color: p.status === 'paid' ? '#0A4437' : '#9C7825' }}>
                          {p.status === 'paid' ? 'مكتمل ✓' : 'قيد المعالجة ⏳'}
                        </span>
                      </td>
                      <td style={S.td}>
                        <button className="btn-hover-lux" style={S.actionBtn}
                          onClick={() => alert(`الفندق: ${p.hotel}\nالمبلغ: ${p.amountSyp} ل.س\nالفترة: ${p.period}`)}>
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#93A29B', padding: '32px 0', fontSize: 13, fontFamily: "'Tajawal',sans-serif" }}>
              لا توجد مستحقات بعد
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap:       { direction: 'rtl', padding: '10px 0', fontFamily: "'Tajawal', sans-serif" },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:      { margin: 0, fontSize: 30, fontWeight: 700, color: '#1C2B27', letterSpacing: '-0.5px', fontFamily: "'Amiri', serif" },
  sub:        { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontWeight: 500 },
  exportBtn:  { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#0A4437', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 },
  kpiCard:    { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 18, padding: '20px', display: 'flex', gap: 14, alignItems: 'center' },
  kpiIcon:    { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiValue:   { margin: '0 0 2px', fontSize: 20, fontWeight: 800, color: '#1C2B27' },
  kpiLabel:   { margin: 0, fontSize: 12, color: '#52655F', fontWeight: 700 },
  kpiSubValue:{ margin: '4px 0 0', fontSize: 11, color: '#93A29B', fontWeight: 500 },
  card:       { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 20, padding: '24px', marginBottom: 24 },
  cardTitle:  { margin: 0, fontSize: 16, fontWeight: 800, color: '#1C2B27' },
  table:      { width: '100%', borderCollapse: 'collapse', minWidth: 600, fontFamily: "'Tajawal', sans-serif" },
  th:         { padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#52655F', background: '#F3EEDD', borderBottom: '1px solid #E5DFC8', whiteSpace: 'nowrap' },
  tr:         { borderBottom: '1px solid #F3EEDD' },
  td:         { padding: '14px 16px', fontSize: 13, color: '#1C2B27', whiteSpace: 'nowrap', textAlign: 'right' },
  pill:       { fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 },
  actionBtn:  { background: '#F3EEDD', border: '1px solid #E5DFC8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
};
