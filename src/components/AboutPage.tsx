import { Award, HeartHandshake, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config';
import { pageContent } from '../lib/content';
import ContentField, { ContentCardList } from './admin/ContentField';
import ImageField from './admin/ImageField';
import SharedField from './admin/SharedField';
import PageShell from './PageShell';

const content = pageContent.about;

export default function AboutPage() {
  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={`Meet ${siteConfig.practitionerName}`}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <ImageField
            path="aboutImage"
            fallback={siteConfig.aboutImage}
            fieldKey="about"
            className="h-[32rem] w-full rounded-[3rem] object-cover shadow-lg"
          />
          <div className="space-y-6">
            <SharedField
              path="credentials"
              fallback={siteConfig.credentials}
              className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
            />
            <ContentField
              sourceId="pages.about"
              path="intro.title"
              fallback={content.intro.title}
              as="h2"
              className="font-heading text-foreground text-4xl font-bold"
            />
            {content.intro.paragraphs.map((paragraph, index) => (
              <ContentField
                key={paragraph}
                sourceId="pages.about"
                path={`intro.paragraphs.${index}`}
                fallback={paragraph}
                as="p"
                className="text-muted-foreground text-lg leading-relaxed"
                multiline
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <ContentField
              sourceId="pages.about"
              path="values.title"
              fallback={content.values.title}
              as="h2"
              className="font-heading text-foreground text-4xl font-bold"
            />
            <ContentField
              sourceId="pages.about"
              path="values.description"
              fallback={content.values.description}
              as="p"
              className="text-muted-foreground mt-4 text-lg leading-relaxed"
              multiline
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <ContentCardList
              sourceId="pages.about"
              path="values.items"
              fallback={content.values.items}
              renderItem={(value, index) => {
                const Icon =
                  index === 0 ? HeartHandshake : index === 1 ? ShieldCheck : Award;

                return (
                  <div className="bg-background rounded-[2rem] border border-border p-6">
                    <Icon className="text-primary mb-5 h-9 w-9" />
                    <h3 className="font-heading text-foreground text-2xl font-bold">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
