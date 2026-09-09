import type { PageKey } from '../../config/site.types';
import practiceContent from '../../content-data/practice.json';
import type { StructuralSiteConfig } from '../../config/site.structural';

type PracticeContent = typeof practiceContent;

export function mergeSiteConfig(structural: StructuralSiteConfig) {
  const pageKeys = Object.keys(structural.pages) as PageKey[];

  const pages = Object.fromEntries(
    pageKeys.map((key) => [
      key,
      {
        ...structural.pages[key],
        ...practiceContent.pages[key],
      },
    ]),
  ) as Record<PageKey, (typeof structural.pages)[PageKey] & (typeof practiceContent.pages)[PageKey]>;

  return {
    ...practiceContent,
    pages,
    forms: {
      ...structural.forms,
      contactForm: practiceContent.forms.contactForm,
      bookSession: {
        ...structural.forms.bookSession,
        ...practiceContent.forms.bookSession,
        externalLink: {
          ...structural.forms.bookSession.externalLink,
          ...practiceContent.forms.bookSession.externalLink,
        },
        calendar: {
          ...structural.forms.bookSession.calendar,
          availabilityHelpText:
            practiceContent.forms.bookSession.calendar.availabilityHelpText,
        },
      },
    },
  };
}

export type MergedSiteConfig = ReturnType<typeof mergeSiteConfig>;
export type { PracticeContent };
