/**
 * AvatarUpload.tsx
 * ─────────────────────────────────────────────────────
 * مكوّن رفع صورة البروفايل — يُستخدم في ProfilePage
 * ─────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AvatarUpload() {
  const { currentUser, uploadAvatar, removeAvatar, getAvatarUrl } = useAuthStore();

  const fileRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const initials   = currentUser?.name?.slice(0, 2).toUpperCase() || 'U';
  const avatarUrl  = preview ?? getAvatarUrl();

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // معاينة فورية
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    const result = await uploadAvatar(file);
    setLoading(false);

    if (result.success) {
      showMsg('ok', 'تم رفع الصورة بنجاح!');
      setPreview(null); // نزيل الـ preview لأن الـ store صار فيه الـ URL الحقيقي
    } else {
      showMsg('err', result.message);
      setPreview(null);
    }

    // reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemove = async () => {
    setLoading(true);
    const result = await removeAvatar();
    setLoading(false);
    setPreview(null);
    if (result.success) showMsg('ok', 'تم حذف الصورة.');
    else showMsg('err', result.message);
  };

  return (
    <div style={S.wrap}>
      {/* الصورة / الحرف الأول */}
      <div style={S.avatarWrap}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="صورة البروفايل"
            style={S.avatarImg}
            onError={() => setPreview(null)}
          />
        ) : (
          <div style={S.avatarFallback}>{initials}</div>
        )}

        {/* زر الكاميرا */}
        <button
          style={S.cameraBtn}
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          aria-label="تغيير الصورة"
          title="تغيير الصورة"
        >
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
        </button>
      </div>

      {/* Input مخفي */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* أزرار */}
      <div style={S.btns}>
        <button style={S.uploadBtn} onClick={() => fileRef.current?.click()} disabled={loading}>
          <Camera size={13} />
          {loading ? 'جارٍ الرفع…' : 'تغيير الصورة'}
        </button>
        {avatarUrl && !loading && (
          <button style={S.removeBtn} onClick={handleRemove}>
            <Trash2 size={13} /> حذف
          </button>
        )}
      </div>

      <p style={S.hint}>JPG أو PNG أو WebP — حجم أقصى 3 MB</p>

      {/* رسالة النجاح/الخطأ */}
      {msg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 8, marginTop: 8,
          background: msg.type === 'ok' ? '#EAF5EF' : '#FCEEE9',
          border:     `1px solid ${msg.type === 'ok' ? '#BFE3D1' : '#F3D2C2'}`,
          color:      msg.type === 'ok' ? '#0E5C4A' : '#96432B',
          fontSize: 12, fontFamily: "'Tajawal', sans-serif",
        }}>
          {msg.type === 'ok' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
          {msg.text}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    padding: '20px 0 4px', direction: 'rtl', fontFamily: "'Tajawal', sans-serif",
  },
  avatarWrap: { position: 'relative', width: 88, height: 88 },
  avatarImg: {
    width: 88, height: 88, borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E5DFC8',
    boxShadow: '0 4px 12px rgba(14,92,74,0.12)',
  },
  avatarFallback: {
    width: 88, height: 88, borderRadius: '50%',
    background: 'linear-gradient(135deg,#0E5C4A,#0A4437)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700,
    border: '3px solid #E5DFC8',
    boxShadow: '0 4px 12px rgba(14,92,74,0.12)',
  },
  cameraBtn: {
    position: 'absolute', bottom: 2, left: 2,
    width: 26, height: 26, borderRadius: '50%',
    background: '#0E5C4A', color: '#fff',
    border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  btns:      { display: 'flex', gap: 8, alignItems: 'center' },
  uploadBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 14px', background: '#E1EEE7', color: '#0A4437',
    border: 'none', borderRadius: 8,
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
  },
  removeBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 12px', background: 'none', color: '#BD5B3E',
    border: '1px solid #F3C4BB', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
  },
  hint: { margin: 0, fontSize: 11, color: '#93A29B' },
};
