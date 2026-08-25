/**
 * supportChatStore.ts
 * ─────────────────────────────────────────────────────
 * دردشة الدعم الفني — مرتبطة بالباكاند عبر HTTP polling.
 * كل بيانات محفوظة في الخادم (JSON files) وليس localStorage.
 * ─────────────────────────────────────────────────────
 */

import { create } from 'zustand';

import { BACKEND_URL } from '../config';
const API = `${BACKEND_URL}/api/support`;
const getToken = () => localStorage.getItem('dhiyafa_token') ?? '';

export type SupportRole = 'user' | 'support' | 'superadmin';

export interface SupportMessage {
  id: string;
  threadId: string;
  fromRole: SupportRole;
  fromUserId: string;
  fromName: string;
  text: string;
  createdAt: number;
  unreadForSupport: boolean;
  unreadForUser: boolean;
}

export interface SupportThread {
  id: string;
  userId: string;
  userName: string;
  createdAt: number;
  lastMessageAt?: number;
  lastMessagePreview?: string;
  unreadForSupport?: number;
  unreadForUser?: number;
}

export interface SupportFeedback {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
  unreadForSupport: boolean;
  repliedText?: string | null;
  repliedAt?: number | null;
}

interface SupportChatState {
  threads: SupportThread[];
  messages: SupportMessage[];
  feedbacks: SupportFeedback[];
  loadingMessages: boolean;

  // ── Threads ──────────────────────────────────────────
  fetchThreads: () => Promise<void>;
  ensureThreadForUser: (payload: { userId: string; userName: string }) => Promise<SupportThread>;

  // ── Messages ─────────────────────────────────────────
  fetchMessages: (threadId: string) => Promise<void>;
  sendMessageFromUser: (payload: { threadId: string; userId: string; userName: string; text: string }) => Promise<SupportMessage | null>;
  sendMessageFromSupport: (payload: { threadId: string; fromUserId: string; fromName: string; text: string }) => Promise<SupportMessage | null>;
  markThreadReadForSupport: (threadId: string) => Promise<void>;
  markThreadReadForUser: (threadId: string, userId: string) => Promise<void>;

  // ── Feedbacks ────────────────────────────────────────
  fetchFeedbacks: () => Promise<void>;
  createFeedbackFromUser: (payload: { userId: string; userName: string; text: string }) => Promise<SupportFeedback | null>;
  markFeedbackReadForSupport: (feedbackId: string) => Promise<void>;
  markAllFeedbackReadForSupport: () => void;
  supportReplyFeedback: (payload: { feedbackId: string; repliedText: string }) => Promise<void>;

  // ── Counts ───────────────────────────────────────────
  getUnreadThreadsForSupport: () => number;
  getUnreadFeedbacksForSupport: () => number;
}

export const useSupportChatStore = create<SupportChatState>()((set, get) => ({
  threads: [],
  messages: [],
  feedbacks: [],
  loadingMessages: false,

  // ════════════════════════════════════════════════════
  // THREADS
  // ════════════════════════════════════════════════════
  fetchThreads: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${API}/threads`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) set({ threads: data.threads });
    } catch (e) { console.error('[support] fetchThreads:', e); }
  },

  ensureThreadForUser: async ({ userId, userName }) => {
    const token = getToken();
    if (!token) throw new Error('No token');
    const res  = await fetch(`${API}/threads`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ userId, userName }),
    });
    const data = await res.json();
    if (data.success) {
      set((s) => {
        const exists = s.threads.some((t) => t.id === data.thread.id);
        return { threads: exists ? s.threads : [data.thread, ...s.threads] };
      });
      return data.thread;
    }
    throw new Error(data.message);
  },

  // ════════════════════════════════════════════════════
  // MESSAGES
  // ════════════════════════════════════════════════════
  fetchMessages: async (threadId) => {
    const token = getToken();
    if (!token || !threadId) return;
    set({ loadingMessages: true });
    try {
      const res  = await fetch(`${API}/threads/${threadId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        // استبدل رسائل هاد الثريد وحافظ على باقي الثريدات
        set((s) => ({
          messages: [
            ...s.messages.filter((m) => m.threadId !== threadId),
            ...data.messages,
          ],
          loadingMessages: false,
        }));
      }
    } catch (e) {
      console.error('[support] fetchMessages:', e);
      set({ loadingMessages: false });
    }
  },

  sendMessageFromUser: async ({ threadId, userId, userName, text }) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res  = await fetch(`${API}/threads/${threadId}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ messages: [...s.messages, data.message] }));
        return data.message;
      }
    } catch (e) { console.error('[support] sendMessageFromUser:', e); }
    return null;
  },

  sendMessageFromSupport: async ({ threadId, fromUserId, fromName, text }) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res  = await fetch(`${API}/threads/${threadId}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ messages: [...s.messages, data.message] }));
        return data.message;
      }
    } catch (e) { console.error('[support] sendMessageFromSupport:', e); }
    return null;
  },

  markThreadReadForSupport: async (threadId) => {
    const token = getToken();
    if (!token) return;
    // optimistic update
    set((s) => ({
      messages: s.messages.map((m) =>
        m.threadId === threadId ? { ...m, unreadForSupport: false } : m
      ),
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, unreadForSupport: 0 } : t
      ),
    }));
    fetch(`${API}/threads/${threadId}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },

  markThreadReadForUser: async (threadId, _userId) => {
    const token = getToken();
    if (!token) return;
    set((s) => ({
      messages: s.messages.map((m) =>
        m.threadId === threadId ? { ...m, unreadForUser: false } : m
      ),
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, unreadForUser: 0 } : t
      ),
    }));
    fetch(`${API}/threads/${threadId}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },

  // ════════════════════════════════════════════════════
  // FEEDBACKS
  // ════════════════════════════════════════════════════
  fetchFeedbacks: async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${API}/feedbacks`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) set({ feedbacks: data.feedbacks });
    } catch (e) { console.error('[support] fetchFeedbacks:', e); }
  },

  createFeedbackFromUser: async ({ userId, userName, text }) => {
    const token = getToken();
    if (!token) return null;
    try {
      const res  = await fetch(`${API}/feedbacks`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ feedbacks: [data.feedback, ...s.feedbacks] }));
        return data.feedback;
      }
    } catch (e) { console.error('[support] createFeedback:', e); }
    return null;
  },

  markFeedbackReadForSupport: async (feedbackId) => {
    const token = getToken();
    set((s) => ({
      feedbacks: s.feedbacks.map((f) =>
        f.id === feedbackId ? { ...f, unreadForSupport: false } : f
      ),
    }));
    if (token) fetch(`${API}/feedbacks/${feedbackId}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },

  markAllFeedbackReadForSupport: () => {
    set((s) => ({
      feedbacks: s.feedbacks.map((f) => ({ ...f, unreadForSupport: false })),
    }));
  },

  supportReplyFeedback: async ({ feedbackId, repliedText }) => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${API}/feedbacks/${feedbackId}/reply`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ repliedText }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) =>
            f.id === feedbackId
              ? { ...f, repliedText, repliedAt: Date.now(), unreadForSupport: false }
              : f
          ),
        }));
      }
    } catch (e) { console.error('[support] replyFeedback:', e); }
  },

  getUnreadThreadsForSupport: () => {
    return get().threads.reduce((s, t) => s + (t.unreadForSupport || 0), 0);
  },

  getUnreadFeedbacksForSupport: () => {
    return get().feedbacks.filter((f) => f.unreadForSupport).length;
  },
}));
