/**
 * ratingsStore.ts
 * ─────────────────────────────────────────────────────
 * تقييمات المستخدمين للفنادق بعد اكتمال الإقامة.
 * مخزّنة في localStorage (لا تحتاج backend لأنها لا تنتقل بين أجهزة مختلفة).
 * ─────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HotelRating {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  hotelId: number;
  hotelName: string;
  stars: number;        // 1-5
  comment: string;
  createdAt: number;
}

interface RatingsState {
  ratings: HotelRating[];
  addRating: (payload: Omit<HotelRating, 'id' | 'createdAt'>) => HotelRating;
  hasRated:  (bookingId: string) => boolean;
  getRatingForBooking: (bookingId: string) => HotelRating | undefined;
}

export const useRatingsStore = create<RatingsState>()(
  persist(
    (set, get) => ({
      ratings: [],

      addRating: (payload) => {
        const rating: HotelRating = {
          ...payload,
          id:        `RT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,
          createdAt: Date.now(),
        };
        set((s) => ({ ratings: [rating, ...s.ratings] }));
        return rating;
      },

      hasRated: (bookingId) => get().ratings.some((r) => r.bookingId === bookingId),

      getRatingForBooking: (bookingId) => get().ratings.find((r) => r.bookingId === bookingId),
    }),
    { name: 'stay-ratings' }
  )
);
