import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportRole = 'user' | 'support' | 'superadmin';

export interface SupportMessage {
  id: string; threadId: string; fromRole: SupportRole;
  fromUserId: string; fromName: string; text: string;
  createdAt: number; unreadForSupport: boolean; unreadForUser: boolean;
}

export interface SupportThread {
  id: string; userId: string; userName: string;
  createdAt: number; lastMessageAt?: number; lastMessagePreview?: string;
  unreadForSupport?: number; unreadForUser?: number;
}

export interface SupportFeedback {
  id: string; userId: string; userName: string; text: string;
  createdAt: number; unreadForSupport: boolean;
  repliedText?: string | null; repliedAt?: number | null;
}

interface SupportChatState {
  threads: SupportThread[]; messages: SupportMessage[]; feedbacks: SupportFeedback[];
  loadingMessages: boolean;
  fetchThreads: () => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  ensureThreadForUser: (p: { userId: string; userName: string }) => Promise<SupportThread>;
  sendMessageFromUser: (p: { threadId: string; userId: string; userName: string; text: string }) => Promise<SupportMessage | null>;
  sendMessageFromSupport: (p: { threadId: string; fromUserId: string; fromName: string; text: string }) => Promise<SupportMessage | null>;
  markThreadReadForSupport: (threadId: string) => Promise<void>;
  markThreadReadForUser: (threadId: string, userId: string) => Promise<void>;
  fetchFeedbacks: () => Promise<void>;
  createFeedbackFromUser: (p: { userId: string; userName: string; text: string }) => Promise<SupportFeedback | null>;
  markFeedbackReadForSupport: (feedbackId: string) => Promise<void>;
  markAllFeedbackReadForSupport: () => void;
  supportReplyFeedback: (p: { feedbackId: string; repliedText: string }) => Promise<void>;
  getUnreadThreadsForSupport: () => number;
  getUnreadFeedbacksForSupport: () => number;
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const now = () => Date.now();

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set, get) => ({
      threads: [], messages: [], feedbacks: [], loadingMessages: false,

      fetchThreads: async () => {},
      fetchMessages: async (_threadId: string) => {},

      ensureThreadForUser: async ({ userId, userName }) => {
        const existing = get().threads.find((t) => t.userId === userId);
        if (existing) return existing;
        const thread: SupportThread = { id: uid('TH'), userId, userName, createdAt: now(), lastMessageAt: now(), lastMessagePreview: 'تم بدء محادثة الدعم' };
        set((s) => ({ threads: [thread, ...s.threads] }));
        return thread;
      },

      sendMessageFromUser: async ({ threadId, userId, userName, text }) => {
        const msg: SupportMessage = { id: uid('MSG'), threadId, fromRole: 'user', fromUserId: userId, fromName: userName, text, createdAt: now(), unreadForSupport: true, unreadForUser: false };
        set((s) => ({ messages: [...s.messages, msg], threads: s.threads.map((t) => t.id === threadId ? { ...t, lastMessageAt: now(), lastMessagePreview: text.slice(0,60) } : t) }));
        return msg;
      },

      sendMessageFromSupport: async ({ threadId, fromUserId, fromName, text }) => {
        const msg: SupportMessage = { id: uid('MSG'), threadId, fromRole: 'support', fromUserId, fromName, text, createdAt: now(), unreadForSupport: false, unreadForUser: true };
        set((s) => ({ messages: [...s.messages, msg], threads: s.threads.map((t) => t.id === threadId ? { ...t, lastMessageAt: now(), lastMessagePreview: text.slice(0,60) } : t) }));
        return msg;
      },

      markThreadReadForSupport: async (threadId) => {
        set((s) => ({ messages: s.messages.map((m) => m.threadId === threadId ? { ...m, unreadForSupport: false } : m) }));
      },

      markThreadReadForUser: async (threadId, _userId) => {
        set((s) => ({ messages: s.messages.map((m) => m.threadId === threadId ? { ...m, unreadForUser: false } : m) }));
      },

      fetchFeedbacks: async () => {},

      createFeedbackFromUser: async ({ userId, userName, text }) => {
        const fb: SupportFeedback = { id: uid('FB'), userId, userName, text, createdAt: now(), unreadForSupport: true };
        set((s) => ({ feedbacks: [fb, ...s.feedbacks] }));
        return fb;
      },

      markFeedbackReadForSupport: async (feedbackId) => {
        set((s) => ({ feedbacks: s.feedbacks.map((f) => f.id === feedbackId ? { ...f, unreadForSupport: false } : f) }));
      },

      markAllFeedbackReadForSupport: () => {
        set((s) => ({ feedbacks: s.feedbacks.map((f) => ({ ...f, unreadForSupport: false })) }));
      },

      supportReplyFeedback: async ({ feedbackId, repliedText }) => {
        set((s) => ({ feedbacks: s.feedbacks.map((f) => f.id === feedbackId ? { ...f, repliedText, repliedAt: now(), unreadForSupport: false } : f) }));
      },

      getUnreadThreadsForSupport: () => {
        const ids = new Set(get().messages.filter((m) => m.unreadForSupport).map((m) => m.threadId));
        return ids.size;
      },

      getUnreadFeedbacksForSupport: () => get().feedbacks.filter((f) => f.unreadForSupport).length,
    }),
    { name: 'stay-support-chat' }
  )
);
