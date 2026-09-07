import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const apps = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/apps' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    nameAr: z.string(),
    tagline: z.string(),
    taglineAr: z.string(),
    iconPath: z.string(),
    status: z.enum(['live', 'soon']),
  }),
});

// Long-form prose pages (about, and future pages like terms/privacy).
// No frontmatter fields are required — the H1 and ## section headings in
// the markdown body itself carry the structure; see src/lib/prose.ts.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({}),
});

export const collections = { apps, pages };
