import { z } from 'zod';
import {
  defineContentSchema,
  fieldImage,
  fieldStringList,
  fieldText,
  fieldTextarea,
} from '../lib/content/field-meta';

const pageLabelSchema = z.object({
  label: z.string(),
  consultationLabel: z.string().optional(),
});

const sessionTypeSchema = z.object({
  label: z.string(),
  durationMinutes: z.number(),
  fee: z.string(),
  description: z.string(),
  modes: z.array(z.enum(['virtual', 'in_person'])),
  kind: z.enum(['consultation', 'session']),
});

export const practiceSchema = z.object({
  practiceName: z.string(),
  practitionerName: z.string(),
  credentials: z.string(),
  tagline: z.string(),
  description: z.string(),
  location: z.string(),
  phone: z.string(),
  email: z.string(),
  hours: z.string(),
  responseTime: z.string(),
  logo: z.string(),
  logoMark: z.string(),
  heroImage: z.string(),
  aboutImage: z.string(),
  defaultImage: z.string(),
  socialLinks: z.object({
    instagram: z.string(),
    linkedin: z.string(),
  }),
  fees: z.object({
    insuranceNotes: z.array(z.string()),
    insuranceHeading: z.string(),
  }),
  pages: z.record(pageLabelSchema),
  forms: z.object({
    bookSession: z.object({
      externalLink: z.object({
        label: z.string(),
        description: z.string(),
      }),
      enabled: z.boolean(),
      siteCtaLabel: z.string(),
      label: z.string(),
      title: z.string(),
      description: z.string(),
      descriptionWithCalendar: z.string(),
      confirmationMessage: z.string(),
      consultationCopy: z.object({
        title: z.string(),
        description: z.string(),
      }),
      consultationSuccessMessage: z.string(),
      calendar: z.object({
        availabilityHelpText: z.string(),
      }),
      sessionTypes: z.array(sessionTypeSchema),
    }),
    contactForm: z.object({
      nameLabel: z.string(),
      emailLabel: z.string(),
      messageLabel: z.string(),
      submitLabel: z.string(),
      disclaimer: z.string(),
      successTitle: z.string(),
      successMessage: z.string(),
      successResetLabel: z.string(),
    }),
  }),
  footer: z.object({
    practiceHeading: z.string(),
    resourcesHeading: z.string(),
  }),
});

export const practiceContentMeta = defineContentSchema({
  practiceName: fieldText({ label: 'Practice name', scope: 'site', group: 'Practice' }),
  practitionerName: fieldText({ label: 'Practitioner name', scope: 'site', group: 'Practice' }),
  credentials: fieldText({ label: 'Credentials', scope: 'site', group: 'Practice' }),
  tagline: fieldText({ label: 'Tagline', scope: 'site', group: 'Practice' }),
  description: fieldTextarea({ label: 'Site description', scope: 'site', group: 'Practice' }),
  location: fieldText({ label: 'Location', scope: 'site', group: 'Contact' }),
  phone: fieldText({ label: 'Phone', scope: 'site', group: 'Contact' }),
  email: fieldText({ label: 'Email', scope: 'site', group: 'Contact' }),
  hours: fieldText({ label: 'Hours', scope: 'site', group: 'Contact' }),
  responseTime: fieldText({ label: 'Response time', scope: 'site', group: 'Contact' }),
  logo: fieldImage({ label: 'Header wordmark (expanded)', scope: 'site', group: 'Images' }),
  logoMark: fieldImage({
    label: 'Header mark (scrolled)',
    scope: 'site',
    group: 'Images',
  }),
  heroImage: fieldImage({ label: 'Home hero image', scope: 'site', group: 'Images' }),
  aboutImage: fieldImage({ label: 'About page image', scope: 'site', group: 'Images' }),
  defaultImage: fieldImage({ label: 'Default image', scope: 'site', group: 'Images' }),
  fees: {
    insuranceNotes: fieldStringList({
      label: 'Insurance notes',
      scope: 'site',
      group: 'Fees',
    }),
    insuranceHeading: fieldText({
      label: 'Insurance section heading',
      scope: 'site',
      group: 'Fees',
    }),
  },
});

export const practiceContentSource = {
  id: 'practice',
  label: 'Site Settings',
  repoPath: 'src/content-data/practice.json',
  schema: practiceSchema,
  fields: practiceContentMeta.fields,
  group: 'settings',
};
