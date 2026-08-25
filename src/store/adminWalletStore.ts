import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminWalletState {
  /** رصيد الادمن الكلي القابل للاسترداد */
  adminBalance: number;
  /** استرداد (رصيد +) */
  addBalance: (amount: number) => void;
  /** خصم (رصيد -) */
  subtractBalance: (amount: number) => void;
}

export const useAdminWalletStore = create<AdminWalletState>()(
  persist(
    (set) => ({
      // Demo الافتراضي: ممكن تغييره لاحقاً
      adminBalance: 100000,
      addBalance: (amount) =>
        set((s) => ({
          adminBalance: s.adminBalance + Math.max(0, amount),
        })),
      subtractBalance: (amount) =>
        set((s) => ({
          adminBalance: s.adminBalance - Math.max(0, amount),
        })),
    }),
    { name: 'stay-admin-wallet' }
  )
);

