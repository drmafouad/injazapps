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

export const collections = { apps };
