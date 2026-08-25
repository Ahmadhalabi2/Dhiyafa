/**
 * notifEvents.ts
 * ─────────────────────────────────────────────────────
 * إشعارات الحجوزات — مرتبطة بالباكاند عبر HTTP polling.
 * addEvent   → POST /api/notifications
 * fetchEvents → GET  /api/notifications  (يُستدعى دورياً)
 * ─────────────────────────────────────────────────────
 */

import { create } from 'zustand';

import { BACKEND_URL } from '../config';
const API = `${BACKEND_URL}/api/notifications`;

const getToken = () => localStorage.getItem('dhiyafa_token') ?? '';

export type BookingEventType =
  | 'booking_created'
  | 'booking_accepted'
  | 'booking_cancelled'
  | 'booking_paid'
  | 'booking_deleted'
  | 'booking_completed'
  | 'booking_rated';

export type NotifTargetRole = 'superadmin' | 'manager' | 'user';

export interface BookingEvent {
  id: string;
  type: BookingEventType;
  bookingId: string | null;
  createdByUserId: string;
  createdByName: string;
  targetRole: NotifTargetRole;
  targetUserId?: string | null;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface NotifEventsState {
  events: BookingEvent[];
  unreadCount: number;
  loading: boolean;

  /** جلب الإشعارات من الباكاند */
  fetchEvents: () => Promise<void>;

  /** إضافة إشعار جديد عبر الباكاند */
  addEvent: (payload: Omit<BookingEvent, 'id' | 'time' | 'unread'>) => Promise<BookingEvent | null>;

  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;

  /** للتوافق مع الكود القديم */
  getEventsForUser: (userId: string, role: NotifTargetRole) => BookingEvent[];
}

export const useNotifEventsStore = create<NotifEventsState>()((set, get) => ({
  events: [],
  unreadCount: 0,
  loading: false,

  fetchEvents: async () => {
    const token = getToken();
    if (!token) return;
    try {
      set({ loading: true });
      const res  = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        set({ events: data.notifications, unreadCount: data.unreadCount, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  addEvent: async (payload) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res  = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // أضف للـ state مباشرة بدون انتظار polling
        set((s) => ({
          events: [data.notification, ...s.events],
          unreadCount: s.unreadCount + 1,
        }));
        return data.notification;
      }
    } catch (e) {
      console.error('[notifEvents] addEvent failed:', e);
    }
    return null;
  },

  markRead: async (id) => {
    const token = getToken();
    if (!token) return;
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, unread: false } : e)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    fetch(`${API}/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },

  markAllRead: async () => {
    const token = getToken();
    if (!token) return;
    set((s) => ({ events: s.events.map((e) => ({ ...e, unread: false })), unreadCount: 0 }));
    fetch(`${API}/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },

  dismiss: async (id) => {
    const token = getToken();
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    if (token) {
      fetch(`${API}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
  },

  getEventsForUser: (userId, role) => {
    return get().events.filter((e) => {
      if (e.targetRole !== role) return false;
      if (e.targetUserId) return e.targetUserId === userId;
      return true;
    });
  },
}));
