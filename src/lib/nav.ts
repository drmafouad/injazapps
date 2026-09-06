import type { Locale } from './i18n';

export const navCopy: Record<Locale, Record<string, string>> = {
  en: {
    home: 'InjazApps',
    owlmd: 'OwlMD',
    mizan: 'Mizan',
    sada: 'Sada',
    about: 'About',
    support: 'Support',
    legal: 'Legal',
    terms: 'Terms',
    privacyOwlmd: 'OwlMD Privacy',
    privacyMizan: 'Mizan Privacy',
    privacySada: 'Sada Privacy',
    switchLanguage: 'العربية',
    toggleTheme: 'Toggle theme',
    skipToContent: 'Skip to content',
  },
  ar: {
    home: 'إنجاز آبس',
    owlmd: 'OwlMD',
    mizan: 'Mizan',
    sada: 'Sada',
    about: 'من نحن',
    support: 'الدعم',
    legal: 'قانوني',
    terms: 'الشروط',
    privacyOwlmd: 'خصوصية OwlMD',
    privacyMizan: 'خصوصية Mizan',
    privacySada: 'خصوصية Sada',
    switchLanguage: 'English',
    toggleTheme: 'تبديل المظهر',
    skipToContent: 'الانتقال إلى المحتوى',
  },
};

export const routes = {
  home: '/',
  owlmd: '/apps/owlmd',
  mizan: '/apps/mizan',
  sada: '/apps/sada',
  about: '/about',
  support: '/support',
  terms: '/legal/terms',
  privacyOwlmd: '/legal/privacy/owlmd',
  privacyMizan: '/legal/privacy/mizan',
  privacySada: '/legal/privacy/sada',
} as const;
