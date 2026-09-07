import type { Locale } from './i18n';

export const homeCopy: Record<Locale, Record<string, string>> = {
  en: {
    wordmark: 'InjazApps',
    tagline: 'Software cut to fit.',
    seeApps: 'See the apps',
    whatThisIs:
      'InjazApps builds mobile apps that do one thing properly. Fast, private by default, and fully usable offline.',
    comingSoon: 'Coming soon',
    builtCarefully: 'Built carefully.',
    howThisWasMade: 'How this was made',
  },
  ar: {
    // "InjazApps" is a brand name and is never translated/transliterated
    // into Arabic script — not even here in running prose. It's rendered
    // directly in the template (wrapped in <bdi>, since it's Latin text
    // inside Arabic running text), so the sentence is split around it:
    // whatThisIsPrefix + "InjazApps" + whatThisIsSuffix.
    wordmark: 'InjazApps',
    tagline: 'برامج مصنوعة على المقاس.',
    seeApps: 'شاهد التطبيقات',
    whatThisIsPrefix: 'تبني',
    whatThisIsSuffix:
      'تطبيقات موبايل تتقن عملًا واحدًا. سريعة، خاصة بطبيعتها، وتعمل بالكامل دون اتصال.',
    comingSoon: 'قريبًا',
    builtCarefully: 'صُنع بعناية.',
    howThisWasMade: 'كيف بُني هذا',
  },
};
