import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookingEventType =
  | 'booking_created' | 'booking_accepted' | 'booking_cancelled'
  | 'booking_paid' | 'booking_deleted' | 'booking_completed' | 'booking_rated';

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
  fetchEvents: () => void;
  addEvent: (payload: Omit<BookingEvent, 'id' | 'time' | 'unread'>) => BookingEvent;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  getEventsForUser: (userId: string, role: NotifTargetRole) => BookingEvent[];
}

export const useNotifEventsStore = create<NotifEventsState>()(
  persist(
    (set, get) => ({
      events: [],
      unreadCount: 0,
      loading: false,

      fetchEvents: () => {
        const count = get().events.filter((e) => e.unread).length;
        set({ unreadCount: count });
      },

      addEvent: (payload) => {
        const ev: BookingEvent = {
          ...payload,
          id:     `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          time:   new Date().toISOString(),
          unread: true,
        };
        set((s) => ({ events: [ev, ...s.events], unreadCount: s.unreadCount + 1 }));
        return ev;
      },

      markRead: (id) => set((s) => ({
        events: s.events.map((e) => e.id === id ? { ...e, unread: false } : e),
        unreadCount: Math.max(0, s.unreadCount - 1),
      })),

      markAllRead: () => set((s) => ({
        events: s.events.map((e) => ({ ...e, unread: false })),
        unreadCount: 0,
      })),

      dismiss: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      getEventsForUser: (userId, role) => get().events.filter((e) => {
        if (e.targetRole !== role) return false;
        if (e.targetUserId) return e.targetUserId === userId;
        return true;
      }),
    }),
    { name: 'stay-booking-events' }
  )
);
