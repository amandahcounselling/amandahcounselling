import homeContent from '../../content-data/pages/home.json';
import aboutContent from '../../content-data/pages/about.json';
import contactContent from '../../content-data/pages/contact.json';
import feesContent from '../../content-data/pages/fees.json';
import faqPageContent from '../../content-data/pages/faq-page.json';
import bookContent from '../../content-data/pages/book.json';
import privacyContent from '../../content-data/pages/privacy.json';
import specialtiesContent from '../../content-data/pages/specialties.json';
import blogContent from '../../content-data/pages/blog.json';
import practiceContent from '../../content-data/practice.json';
import faqContent from '../../content-data/faq.json';

export const pageContent = {
  home: homeContent,
  about: aboutContent,
  contact: contactContent,
  fees: feesContent,
  faq: faqPageContent,
  book: bookContent,
  privacy: privacyContent,
  specialties: specialtiesContent,
  blog: blogContent,
} as const;

export const contentData = {
  practice: practiceContent,
  faq: faqContent,
  pages: pageContent,
} as const;

export type PageContentKey = keyof typeof pageContent;
export type ContentSourceId = 'practice' | 'faq' | `pages.${PageContentKey}`;

export const CONTENT_REPO_PATHS: Record<string, string> = {
  practice: 'src/content-data/practice.json',
  faq: 'src/content-data/faq.json',
  'pages.home': 'src/content-data/pages/home.json',
  'pages.about': 'src/content-data/pages/about.json',
  'pages.contact': 'src/content-data/pages/contact.json',
  'pages.fees': 'src/content-data/pages/fees.json',
  'pages.faq': 'src/content-data/pages/faq-page.json',
  'pages.book': 'src/content-data/pages/book.json',
  'pages.privacy': 'src/content-data/pages/privacy.json',
  'pages.specialties': 'src/content-data/pages/specialties.json',
  'pages.blog': 'src/content-data/pages/blog.json',
};

export function getContentBySourceId(sourceId: string): unknown {
  if (sourceId === 'practice') return practiceContent;
  if (sourceId === 'faq') return faqContent;
  if (sourceId.startsWith('pages.')) {
    const pageKey = sourceId.replace('pages.', '') as PageContentKey;
    return pageContent[pageKey];
  }
  return undefined;
}

export { getByPath, setByPath } from './field-meta';
