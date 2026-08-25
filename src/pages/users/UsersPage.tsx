import { useState } from 'react';
import { Search, ShieldCheck, Shield, User as UserIcon, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';

const ROLE_INFO: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  superadmin: { label: 'مدير النظام الرئيسي', bg: '#F6EBCB', text: '#9C7825', icon: <ShieldCheck size={13} /> },
  manager:    { label: 'مدير الفندق',        bg: '#E1EEE7', text: '#0A4437', icon: <Shield size={13} /> },
  user:       { label: 'مستخدم',              bg: '#F3EEDD', text: '#52655F', icon: <UserIcon size={13} /> },
};

export default function UsersPage() {
  const { users, currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>المستخدمون</h1>
          <p style={S.sub}>{users.length} حساب مسجّل (مدراء النظام، مدراء الفنادق، ومستخدمون)</p>
        </div>
      </div>

      <div style={S.toolbar}>
        <div style={S.searchBox}>
          <Search size={15} color="#93A29B" />
          <input style={S.searchIn} placeholder="ابحث عن مستخدم…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={S.filterGroup}>
          {['all', 'superadmin', 'manager', 'user'].map((r) => (
            <button key={r} style={{ ...S.filterBtn, ...(roleFilter === r ? S.filterActive : {}) }} onClick={() => setRoleFilter(r)}>
              {r === 'all' ? 'الكل' : ROLE_INFO[r].label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {['المستخدم', 'البريد الإلكتروني', 'الصلاحية', ''].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const r = ROLE_INFO[u.role];
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={S.avatar}>{u.name.slice(0, 2).toUpperCase()}</div>
                      <span style={{ fontWeight: 700 }}>{u.name}{isSelf && <span style={S.youTag}>أنت</span>}</span>
                    </div>
                  </td>
                  <td style={{ ...S.td, color: '#52655F' }}>{u.email}</td>
                  <td style={S.td}>
                    <span style={{ ...S.pill, background: r.bg, color: r.text }}>{r.icon} {r.label}</span>
                  </td>
                  <td style={S.td}>
                    <button
                      style={{ ...S.actionBtn, opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                      disabled={isSelf}
                      onClick={() => alert(`حذف ${u.name}؟ (تجريبي فقط)`)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#93A29B', padding: '40px 0', fontFamily: "'Tajawal', sans-serif" }}>لم يتم العثور على مستخدمين.</p>
        )}
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, direction: 'rtl' },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', direction: 'rtl' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5DFC8', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 200 },
  searchIn: { background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#1C2B27', width: '100%', fontFamily: "'Tajawal', sans-serif" },
  filterGroup: { display: 'flex', gap: 6 },
  filterBtn: { padding: '8px 14px', borderRadius: 8, border: '1px solid #E5DFC8', background: '#fff', color: '#52655F', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  filterActive: { background: '#E1EEE7', color: '#0A4437', borderColor: '#0E5C4A' },
  tableWrap: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 14, overflow: 'auto', direction: 'rtl' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500, fontFamily: "'Tajawal', sans-serif" },
  th: { padding: '13px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#52655F', background: '#F3EEDD', borderBottom: '1px solid #E5DFC8', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F3EEDD' },
  td: { padding: '13px 16px', fontSize: 13, color: '#1C2B27' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  youTag: { marginRight: 8, fontSize: 10, fontWeight: 700, color: '#0A4437', background: '#E1EEE7', padding: '2px 6px', borderRadius: 6 },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  actionBtn: { background: '#fff', border: '1px solid #FAEAE2', borderRadius: 7, padding: '6px 9px', color: '#BD5B3E', display: 'flex' },
};