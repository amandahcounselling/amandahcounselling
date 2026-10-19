import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specialties = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specialties' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    heroImage: z.string(),
    /** Lucide icon name (e.g. Leaf) or an emoji — used on home specialty preview cards. */
    icon: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { specialties, blog };
