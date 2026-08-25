import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'superadmin' | 'support' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  avatar?: string | null;
}

import { BACKEND_URL } from '../config';

const API        = `${BACKEND_URL}/api/auth`;
const UPLOAD_API = `${BACKEND_URL}/api/upload`;
const BACKEND    = BACKEND_URL;

interface AuthState {
  currentUser: Omit<User, 'password'> | null;
  users: User[];
  isAuthenticated: boolean;

  login:          (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithToken: (user: Omit<User, 'password'>) => void;
  signup:         (name: string, email: string, password: string) => { success: boolean; message: string };
  deleteAccount:  () => Promise<{ success: boolean; message: string }>;
  logout:         () => void;

  /** رفع صورة البروفايل */
  uploadAvatar:   (file: File) => Promise<{ success: boolean; message: string }>;
  /** حذف صورة البروفايل */
  removeAvatar:   () => Promise<{ success: boolean; message: string }>;
  /** رابط الصورة الكامل — يُعيد null إذا لم تكن موجودة */
  getAvatarUrl:   () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser:    null,
      users:          [],
      isAuthenticated: false,

      // ── Login ────────────────────────────────────────────────────────────
      login: async (email, password) => {
        try {
          const res  = await fetch(`${API}/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!data.success) return { success: false, message: data.message || 'الإيميل أو كلمة المرور غير صحيحة.' };
          if (data.token) localStorage.setItem('dhiyafa_token', data.token);
          set({ currentUser: data.user, isAuthenticated: true });
          return { success: true, message: data.message || 'مرحباً بعودتك!' };
        } catch {
          return { success: false, message: 'تعذّر الاتصال بالخادم. تأكد من تشغيل الباكاند على المنفذ 5000.' };
        }
      },

      // ── loginWithToken بعد OTP ───────────────────────────────────────────
      loginWithToken: (user) => set({ currentUser: user, isAuthenticated: true }),

      // ── signup محلي (احتياطي) ────────────────────────────────────────────
      signup: (name, email, password) => {
        const all = get().users;
        if (all.find((u) => u.email.toLowerCase() === email.toLowerCase()))
          return { success: false, message: 'هذا الإيميل مسجل مسبقاً.' };
        const newUser: User = { id: Date.now().toString(), name, email, password, role: 'user' };
        set((s) => ({ users: [...s.users, newUser] }));
        const { password: _pw, ...safe } = newUser;
        set({ currentUser: safe, isAuthenticated: true });
        return { success: true, message: 'تم إنشاء الحساب!' };
      },

      // ── حذف الحساب ──────────────────────────────────────────────────────
      deleteAccount: async () => {
        const token = localStorage.getItem('dhiyafa_token');
        if (!token) return { success: false, message: 'الجلسة غير صالحة.' };
        try {
          const res  = await fetch(`${API}/account`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (!data.success) return { success: false, message: data.message };
          localStorage.removeItem('dhiyafa_token');
          set({ currentUser: null, isAuthenticated: false });
          return { success: true, message: 'تم حذف الحساب بنجاح.' };
        } catch {
          return { success: false, message: 'تعذّر الاتصال بالخادم.' };
        }
      },

      // ── رفع صورة البروفايل ───────────────────────────────────────────────
      uploadAvatar: async (file) => {
        const token = localStorage.getItem('dhiyafa_token');
        if (!token) return { success: false, message: 'الجلسة غير صالحة.' };
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const res  = await fetch(`${UPLOAD_API}/avatar`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${token}` },
            body:    formData,
          });
          const data = await res.json();
          if (!data.success) return { success: false, message: data.message };
          // تحديث الـ currentUser بالصورة الجديدة
          set((s) => ({
            currentUser: s.currentUser ? { ...s.currentUser, avatar: data.avatarUrl } : null,
          }));
          return { success: true, message: 'تم رفع الصورة بنجاح.' };
        } catch {
          return { success: false, message: 'تعذّر رفع الصورة.' };
        }
      },

      // ── حذف صورة البروفايل ──────────────────────────────────────────────
      removeAvatar: async () => {
        const token = localStorage.getItem('dhiyafa_token');
        if (!token) return { success: false, message: 'الجلسة غير صالحة.' };
        try {
          const res  = await fetch(`${UPLOAD_API}/avatar`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (!data.success) return { success: false, message: data.message };
          set((s) => ({
            currentUser: s.currentUser ? { ...s.currentUser, avatar: null } : null,
          }));
          return { success: true, message: 'تم حذف الصورة.' };
        } catch {
          return { success: false, message: 'تعذّر حذف الصورة.' };
        }
      },

      // ── رابط الصورة الكامل ───────────────────────────────────────────────
      getAvatarUrl: () => {
        const avatar = get().currentUser?.avatar;
        if (!avatar) return null;
        // إذا كان relative path نضيف base URL
        if (avatar.startsWith('http')) return avatar;
        return `${BACKEND}${avatar}`;
      },

      logout: () => {
        localStorage.removeItem('dhiyafa_token');
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    { name: 'stay-auth' }
  )
);
