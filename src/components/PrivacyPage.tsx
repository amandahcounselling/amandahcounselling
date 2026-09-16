import { siteConfig } from '../config';
import { pageContent } from '../lib/content';
import type { PageSection } from '../content-data/pages.schema';
import ContentField from './admin/ContentField';
import SharedField from './admin/SharedField';
import PageShell from './PageShell';
import PageSections from './PageSections';

const content = pageContent.privacy;

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="bg-card mx-auto max-w-3xl rounded-[2rem] border border-border p-8 shadow-sm md:p-12">
          <div className="space-y-8">
            <PageSections
              sourceId="pages.privacy"
              sections={content.sections as PageSection[]}
              variant="article"
            />
            <section className="space-y-3">
              <ContentField
                sourceId="pages.privacy"
                path="contactHeading"
                fallback={content.contactHeading}
                as="h2"
                className="font-heading text-foreground text-2xl font-bold"
              />
              <p className="text-muted-foreground leading-relaxed">
                <ContentField
                  sourceId="pages.privacy"
                  path="contactBodyPrefix"
                  fallback={content.contactBodyPrefix}
                />{' '}
                <a className="text-primary font-bold" href={`mailto:${siteConfig.email}`}>
                  <SharedField path="email" fallback={siteConfig.email} />
                </a>
                .
              </p>
            </section>
            <ContentField
              sourceId="pages.privacy"
              path="lastUpdated"
              fallback={content.lastUpdated}
              as="p"
              className="border-border border-t pt-5 text-sm text-muted-foreground"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
