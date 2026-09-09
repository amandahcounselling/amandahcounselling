import { ArrowRight } from 'lucide-react';
import { pageContent } from '../lib/content';
import { withBase } from '../lib/paths';
import ContentField from './admin/ContentField';
import PageShell from './PageShell';

export type SpecialtySummary = {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
};

type SpecialtiesPageProps = {
  specialties: SpecialtySummary[];
};

const content = pageContent.specialties;

export default function SpecialtiesPage({ specialties }: SpecialtiesPageProps) {
  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {specialties.map((specialty) => (
            <a
              key={specialty.slug}
              href={withBase(`/specialties/${specialty.slug}`)}
              className="bg-card group overflow-hidden rounded-[2rem] border border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={withBase(specialty.heroImage)}
                alt=""
                className="h-48 w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <h2 className="font-heading text-foreground text-2xl font-bold">
                  {specialty.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {specialty.description}
                </p>
                <span className="text-primary inline-flex items-center gap-2 font-bold">
                  <ContentField
                    sourceId="pages.specialties"
                    path="cardCta"
                    fallback={content.cardCta}
                  />
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
