import type { Locale } from './i18n';

export const homeCopy: Record<Locale, Record<string, string>> = {
  en: {
    wordmark: 'InjazApps',
    tagline: 'Software cut to fit.',
    seeApps: 'See the apps',
    whatThisIs:
      "InjazApps is a small studio in Kuwait building focused mobile apps. Arabic first, offline where it matters, no accounts you don't need.",
    comingSoon: 'Coming soon',
    builtInKuwait: 'Built in Kuwait.',
    howThisWasMade: 'How this was made',
  },
  ar: {
    // "InjazApps" is a brand name and is never translated/transliterated
    // into Arabic script — not even here in running prose. It's rendered
    // directly in the template (wrapped in <bdi>, since it's Latin text
    // inside Arabic running text), so this sentence starts from the word
    // right after it.
    wordmark: 'InjazApps',
    tagline: 'برامج مصنوعة على المقاس.',
    seeApps: 'شاهد التطبيقات',
    whatThisIs:
      'استوديو صغير في الكويت يبني تطبيقات موبايل مركّزة. عربي أولًا، يعمل دون اتصال حيث يهم، وبلا حسابات لا تحتاجها.',
    comingSoon: 'قريبًا',
    builtInKuwait: 'صُنع في الكويت.',
    howThisWasMade: 'كيف بُني هذا',
  },
};
