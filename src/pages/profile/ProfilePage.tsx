import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Calendar, LogOut, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import AvatarUpload from '../../components/AvatarUpload';

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'مدير النظام الرئيسي',
  manager: 'مدير الفندق',
  support: 'موظف الدعم',
  user: 'عميل',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout, deleteAccount, getAvatarUrl } = useAuthStore();
  const initials = currentUser?.name?.slice(0, 2).toUpperCase() || 'U';
  const roleKey  = (currentUser?.role as string) || 'user';
  const isUser   = currentUser?.role === 'user';
  const avatarUrl = getAvatarUrl();

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [delError, setDelError]       = useState('');

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDelError('');
    const result = await deleteAccount();
    setDeleting(false);
    if (result.success) {
      navigate('/login', { replace: true });
    } else {
      setDelError(result.message);
    }
  };

  return (
    <Layout>
      <h1 style={S.title}>ملفي الشخصي</h1>
      <p style={S.sub}>تفاصيل الحساب والنشاط</p>

      <div style={S.card}>
        <div style={S.topRow}>
          {/* صورة البروفايل مع خيار الرفع */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AvatarUpload />
          </div>
          <div style={{ flex: 1 }}>
            <p style={S.name}>{currentUser?.name}</p>
            <span style={S.rolePill}><Shield size={11} /> {ROLE_LABEL[roleKey] || roleKey}</span>
          </div>
          <button style={S.editBtn} onClick={() => navigate('/settings')}>
            <Edit2 size={14} /> تعديل
          </button>
        </div>

        <div style={S.infoGrid}>
          <div style={S.infoItem}>
            <Mail size={16} color="#0E5C4A" />
            <div>
              <p style={S.infoLabel}>البريد الإلكتروني</p>
              <p style={S.infoVal}>{currentUser?.email}</p>
            </div>
          </div>
          <div style={S.infoItem}>
            <Shield size={16} color="#C69A3A" />
            <div>
              <p style={S.infoLabel}>الصلاحية</p>
              <p style={S.infoVal}>{ROLE_LABEL[roleKey] || roleKey}</p>
            </div>
          </div>
          <div style={S.infoItem}>
            <Calendar size={16} color="#BD5B3E" />
            <div>
              <p style={S.infoLabel}>عضو منذ</p>
              <p style={S.infoVal}>يونيو 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── إجراءات الحساب ── */}
      <div style={S.card}>
        <p style={S.cardTitle}>إجراءات الحساب</p>

        <button style={S.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} style={{ transform: 'rotate(180deg)' }} /> تسجيل الخروج من نُزُل
        </button>

        {/* زر حذف الحساب — فقط للمستخدم العادي */}
        {isUser && !showConfirm && (
          <button style={S.deleteBtn} onClick={() => setShowConfirm(true)}>
            <Trash2 size={15} /> حذف حسابي نهائياً
          </button>
        )}

        {/* نافذة تأكيد الحذف */}
        {isUser && showConfirm && (
          <div style={S.confirmBox}>
            <div style={S.confirmIcon}>
              <AlertTriangle size={22} color="#BD5B3E" />
            </div>
            <p style={S.confirmTitle}>هل أنت متأكد؟</p>
            <p style={S.confirmDesc}>
              سيتم حذف حسابك نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </p>
            {delError && <p style={S.delError}>{delError}</p>}
            <div style={S.confirmActions}>
              <button
                style={S.confirmDeleteBtn}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                <Trash2 size={14} />
                {deleting ? 'جارٍ الحذف…' : 'نعم، احذف حسابي'}
              </button>
              <button
                style={S.cancelBtn}
                onClick={() => { setShowConfirm(false); setDelError(''); }}
                disabled={deleting}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 24px', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  card: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, padding: '24px', marginBottom: 20, maxWidth: 600, direction: 'rtl' },
  topRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #F3EEDD' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 },
  name: { margin: '0 0 6px', fontSize: 19, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  rolePill: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E1EEE7', color: '#0A4437', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  editBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5DFC8', borderRadius: 8, background: '#F3EEDD', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: 16 },
  infoItem: { display: 'flex', alignItems: 'center', gap: 12 },
  infoLabel: { margin: '0 0 2px', fontSize: 11, color: '#93A29B' },
  infoVal: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  cardTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: 'none', border: '1px solid #FAEAE2', color: '#BD5B3E', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Tajawal', sans-serif", marginBottom: 12 },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: 'none', border: '1px solid #f3c4bb', color: '#96432B', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Tajawal', sans-serif" },
  confirmBox: { marginTop: 4, background: '#FDF3F0', border: '1px solid #F3C4BB', borderRadius: 12, padding: '20px', textAlign: 'center' as const },
  confirmIcon: { marginBottom: 10 },
  confirmTitle: { margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#7A2E1A', fontFamily: "'Tajawal', sans-serif" },
  confirmDesc: { margin: '0 0 16px', fontSize: 13, color: '#96432B', lineHeight: 1.6, fontFamily: "'Tajawal', sans-serif" },
  delError: { margin: '0 0 12px', fontSize: 12, color: '#96432B', background: '#FCEEE9', borderRadius: 8, padding: '8px 12px' },
  confirmActions: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const },
  confirmDeleteBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#BD5B3E', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" },
  cancelBtn: { padding: '10px 20px', background: '#fff', color: '#52655F', border: '1px solid #E5DFC8', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Tajawal', sans-serif" },
};