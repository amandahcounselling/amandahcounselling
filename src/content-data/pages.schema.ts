import { z } from 'zod';

const cardItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const pageSectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    eyebrow: z.string(),
    subtitle: z.string(),
    specialtiesCta: z.string(),
  }),
  z.object({
    type: z.literal('prose'),
    title: z.string().optional(),
    paragraphs: z.array(z.string()),
    withImage: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('cards'),
    eyebrow: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    items: z.array(cardItemSchema),
  }),
  z.object({
    type: z.literal('bullets'),
    eyebrow: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal('specialtiesPreview'),
    eyebrow: z.string(),
    title: z.string(),
    seeAllLabel: z.string(),
  }),
  z.object({
    type: z.literal('cta'),
    title: z.string(),
    description: z.string(),
  }),
]);

const shellSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  descriptionWithCalendar: z.string().optional(),
});

const metaSchema = z.object({
  description: z.string(),
  titleSuffix: z.string().optional(),
});

export const pageContentSchema = z
  .object({
    meta: metaSchema,
    shell: shellSchema.optional(),
    sections: z.array(pageSectionSchema),
    sidebar: z.record(z.string(), z.string()).optional(),
    external: z
      .object({
        description: z.string(),
      })
      .optional(),
    cardCta: z.string().optional(),
    readArticleLabel: z.string().optional(),
    backLinkLabel: z.string().optional(),
    detailEyebrow: z.string().optional(),
    contactHeading: z.string().optional(),
    contactBodyPrefix: z.string().optional(),
    lastUpdated: z.string().optional(),
  })
  .passthrough();

export type PageSection = z.infer<typeof pageSectionSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;

export default pageContentSchema;
