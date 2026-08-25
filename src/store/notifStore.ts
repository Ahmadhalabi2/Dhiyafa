import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notif {
  id: number;
  type: 'booking' | 'review' | 'alert' | 'customer' | 'confirm';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const INITIAL: Notif[] = [
  { id: 1, type: 'booking',  title: 'New booking received',  desc: 'Ahmed Al Rashid booked Burj Al Arab for Jul 1–5', time: '5 min ago',  unread: true },
  { id: 2, type: 'review',   title: 'New review posted',     desc: 'Sara Johnson left a 5-star review for Aman Tokyo', time: '1 hour ago', unread: true },
  { id: 3, type: 'alert',    title: 'Payment failed',        desc: 'Booking BK-006 payment could not be processed',   time: '2 hours ago',unread: true },
  { id: 4, type: 'customer', title: 'New customer signed up',desc: 'Priya Sharma created an account',                  time: '5 hours ago',unread: true },
  { id: 5, type: 'confirm',  title: 'Booking confirmed',     desc: 'BK-003 has been confirmed and payment received',  time: 'Yesterday',  unread: false },
  { id: 6, type: 'booking',  title: 'Check-out reminder',    desc: '3 guests are checking out today at Four Seasons', time: 'Yesterday',  unread: false },
];

interface NotifState {
  notifs: Notif[];
  unreadCount: () => number;
  markRead: (id: number) => void;
  markAllRead: () => void;
  dismiss: (id: number) => void;
}

export const useNotifStore = create<NotifState>()(
  persist(
    (set, get) => ({
      notifs: INITIAL,
      unreadCount: () => get().notifs.filter((n) => n.unread).length,
      markRead: (id) => set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, unread: false } : n)) })),
      markAllRead: () => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, unread: false })) })),
      dismiss: (id) => set((s) => ({ notifs: s.notifs.filter((n) => n.id !== id) })),
    }),
    { name: 'stay-notifs' }
  )
);
