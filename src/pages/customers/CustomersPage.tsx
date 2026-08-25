import { useState } from 'react';
import { Search, Mail, Phone, MapPin, Star, Eye, Plus } from 'lucide-react';
import Layout from '../../components/Layout';

const CUSTOMERS = [
  { id: 1, name: 'Ahmed Al Rashid', email: 'ahmed.r@email.com', phone: '+971 50 123 4567', country: 'UAE',     bookings: 8,  spent: 14200, tier: 'VIP'   },
  { id: 2, name: 'Sara Johnson',    email: 'sara.j@email.com',  phone: '+1 415 555 0192',  country: 'USA',     bookings: 3,  spent: 5400,  tier: 'Gold'  },
  { id: 3, name: 'Marc Dupont',     email: 'marc.d@email.com',  phone: '+33 6 12 34 56 78',country: 'France',  bookings: 12, spent: 22800, tier: 'VIP'   },
  { id: 4, name: 'Yuki Tanaka',     email: 'yuki.t@email.com',  phone: '+81 90 1234 5678', country: 'Japan',   bookings: 5,  spent: 8950,  tier: 'Gold'  },
  { id: 5, name: 'Emma Wilson',     email: 'emma.w@email.com',  phone: '+44 7700 900123',  country: 'UK',      bookings: 2,  spent: 1560,  tier: 'Silver'},
  { id: 6, name: 'Carlos Mendez',   email: 'carlos.m@email.com',phone: '+52 55 1234 5678', country: 'Mexico',  bookings: 1,  spent: 2040,  tier: 'Silver'},
  { id: 7, name: 'Priya Sharma',    email: 'priya.s@email.com', phone: '+91 98765 43210',  country: 'India',   bookings: 6,  spent: 9800,  tier: 'Gold'  },
];

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  VIP:    { bg: '#fef3c7', text: '#92400e' },
  Gold:   { bg: '#eef2ff', text: '#4338ca' },
  Silver: { bg: '#f1f5f9', text: '#475569' },
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Customers</h1>
          <p style={S.sub}>{CUSTOMERS.length} registered customers</p>
        </div>
        <button style={S.addBtn} onClick={() => alert('Add customer form — coming soon!')}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={S.searchBox}>
        <Search size={15} color="#94a3b8" />
        <input style={S.searchIn} placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={S.grid}>
        {filtered.map((c) => {
          const tier = TIER_COLORS[c.tier];
          return (
            <div key={c.id} style={S.card}>
              <div style={S.cardTop}>
                <div style={S.avatar}>{c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                <span style={{ ...S.tierPill, background: tier.bg, color: tier.text }}>
                  <Star size={11} fill={tier.text} /> {c.tier}
                </span>
              </div>
              <p style={S.name}>{c.name}</p>
              <p style={S.detail}><Mail size={12} /> {c.email}</p>
              <p style={S.detail}><Phone size={12} /> {c.phone}</p>
              <p style={S.detail}><MapPin size={12} /> {c.country}</p>
              <div style={S.stats}>
                <div>
                  <p style={S.statVal}>{c.bookings}</p>
                  <p style={S.statLbl}>Bookings</p>
                </div>
                <div>
                  <p style={S.statVal}>${c.spent.toLocaleString()}</p>
                  <p style={S.statLbl}>Total spent</p>
                </div>
              </div>
              <button style={S.viewBtn} onClick={() => alert(`Viewing profile of ${c.name}`)}>
                <Eye size={14} /> View Profile
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>No customers found.</p>
      )}
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a' },
  sub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 14px', marginBottom: 24, maxWidth: 400 },
  searchIn: { background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700 },
  tierPill: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 20 },
  name: { margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0f172a' },
  detail: { margin: '0 0 5px', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  stats: { display: 'flex', gap: 24, margin: '16px 0', paddingTop: 14, borderTop: '1px solid #f1f5f9' },
  statVal: { margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' },
  statLbl: { margin: 0, fontSize: 11, color: '#94a3b8' },
  viewBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' },
};
