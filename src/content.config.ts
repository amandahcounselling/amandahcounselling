import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const specialties = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specialties' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    heroImage: z.string(),
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
