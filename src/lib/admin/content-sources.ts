import { practiceContentSource } from '../../content-data/practice.schema';
import { CONTENT_REPO_PATHS } from '../content';

export type ContentSourceDefinition = {
  id: string;
  label: string;
  repoPath: string;
  group: 'settings' | 'pages' | 'faq' | 'collections';
};

const pageSources: ContentSourceDefinition[] = Object.entries(CONTENT_REPO_PATHS)
  .filter(([id]) => id.startsWith('pages.'))
  .map(([id, repoPath]) => ({
    id,
    label: formatPageLabel(id),
    repoPath,
    group: 'pages' as const,
  }));

const staticSources: ContentSourceDefinition[] = [
  {
    id: practiceContentSource.id,
    label: practiceContentSource.label,
    repoPath: practiceContentSource.repoPath,
    group: 'settings',
  },
  {
    id: 'faq',
    label: 'FAQ',
    repoPath: CONTENT_REPO_PATHS.faq,
    group: 'faq',
  },
  ...pageSources,
];

export const markdownCollections = [
  {
    id: 'specialties',
    label: 'Specialties',
    repoPath: 'src/content/specialties',
    frontmatterFields: ['title', 'description', 'order', 'heroImage'] as const,
  },
  {
    id: 'blog',
    label: 'Blog',
    repoPath: 'src/content/blog',
    frontmatterFields: ['title', 'description', 'pubDate', 'heroImage', 'draft'] as const,
  },
] as const;

export function getContentSources() {
  return staticSources;
}

export function getContentSourceById(id: string) {
  return staticSources.find((source) => source.id === id);
}

function formatPageLabel(sourceId: string) {
  const page = sourceId.replace('pages.', '');
  return page.charAt(0).toUpperCase() + page.slice(1);
}

const schemaModules = import.meta.glob('../../content-data/**/*.schema.ts', {
  eager: true,
}) as Record<string, { practiceContentSource?: typeof practiceContentSource }>;

export function getDiscoveredSchemaModules() {
  return Object.values(schemaModules);
}
