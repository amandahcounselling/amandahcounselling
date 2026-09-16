import { pageContent } from '../lib/content';
import type { PageSection } from '../content-data/pages.schema';
import PageShell from './PageShell';
import PageSections from './PageSections';

const content = pageContent.about;

export default function AboutPage() {
  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <PageSections
        sourceId="pages.about"
        sections={content.sections as PageSection[]}
      />
    </PageShell>
  );
}
