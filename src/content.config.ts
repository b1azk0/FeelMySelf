import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['pl']).default('pl'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
