import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'ar';

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const getInitialLang = (): Lang => {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem('stay-i18n-lang');
  if (saved === 'ar' || saved === 'en') return saved;

  const navLang = window.navigator.language?.toLowerCase() || '';
  if (navLang.startsWith('ar')) return 'ar';
  return 'en';
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: getInitialLang(),
      setLang: (lang) => {
        set({ lang });
        try {
          window.localStorage.setItem('stay-i18n-lang', lang);
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'stay-i18n',
    }
  )
);

