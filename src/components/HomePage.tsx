import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { getBookCtaLabel, siteConfig } from '../config';
import { pageContent } from '../lib/content';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import ContentField, { ContentCardList } from './admin/ContentField';
import ImageField from './admin/ImageField';
import SharedField from './admin/SharedField';
import AdminSessionGate from './admin/AdminSessionGate';
import { AdminProvider, useOptionalAdmin } from '../lib/admin/admin-context';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type HomeSpecialty = {
  slug: string;
  title: string;
  description: string;
};

type HomePageProps = {
  specialties: HomeSpecialty[];
};

const content = pageContent.home;

function HomePageContent({ specialties }: HomePageProps) {
  const admin = useOptionalAdmin();
  const bookLink = getBookLinkProps();
  const consultationHref = siteConfig.pages.book.enabled
    ? bookLink.href
    : withBase(siteConfig.pages.contact.href);
  const consultationLabel = siteConfig.pages.book.enabled
    ? getBookCtaLabel()
    : siteConfig.pages.contact.label;
  const showSpecialties =
    siteConfig.pages.specialties.enabled && specialties.length > 0;

  return (
    <div className="bg-background min-h-screen pb-24">
        <SiteHeader />
        <main>
          <section className="from-primary/10 via-background to-secondary/20 bg-gradient-to-br px-6 py-20 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <div className="space-y-5">
                  <ContentField
                    sourceId="pages.home"
                    path="hero.eyebrow"
                    fallback={content.hero.eyebrow}
                    className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
                  />
                  <h1 className="font-heading text-foreground text-5xl font-bold leading-tight md:text-7xl">
                    <SharedField path="tagline" fallback={siteConfig.tagline} />
                  </h1>
                  <ContentField
                    sourceId="pages.home"
                    path="hero.subtitle"
                    fallback={content.hero.subtitle}
                    as="p"
                    className="text-muted-foreground max-w-2xl text-xl leading-relaxed"
                    multiline
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href={consultationHref}
                    target={bookLink.target}
                    rel={bookLink.rel}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
                  >
                    {consultationLabel}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {siteConfig.pages.specialties.enabled && (
                    <a
                      href={withBase('/specialties')}
                      className="border-primary text-primary hover:bg-primary/10 inline-flex items-center justify-center rounded-full border px-6 py-3 font-bold transition-colors"
                    >
                      <ContentField
                        sourceId="pages.home"
                        path="hero.specialtiesCta"
                        fallback={content.hero.specialtiesCta}
                      />
                    </a>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="bg-accent absolute -left-5 -top-5 h-32 w-32 rounded-full blur-3xl" />
                <ImageField
                  path="heroImage"
                  fallback={siteConfig.heroImage}
                  fieldKey="hero"
                  className="relative h-[34rem] w-full rounded-[3rem] object-cover shadow-2xl"
                />
              </div>
            </div>
          </section>

          <section className="px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <ContentField
                  sourceId="pages.home"
                  path="approach.eyebrow"
                  fallback={content.approach.eyebrow}
                  className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
                />
                <ContentField
                  sourceId="pages.home"
                  path="approach.title"
                  fallback={content.approach.title}
                  as="h2"
                  className="font-heading text-foreground mt-3 text-4xl font-bold md:text-5xl"
                />
                <ContentField
                  sourceId="pages.home"
                  path="approach.description"
                  fallback={content.approach.description}
                  as="p"
                  className="text-muted-foreground mt-5 text-lg leading-relaxed"
                  multiline
                />
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                <ContentCardList
                  sourceId="pages.home"
                  path="approach.items"
                  fallback={content.approach.items}
                  renderItem={(approach) => (
                    <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
                      <HeartHandshake className="text-primary mb-5 h-9 w-9" />
                      <h3 className="font-heading text-foreground text-2xl font-bold">
                        {approach.title}
                      </h3>
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {approach.description}
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          </section>

          <section className="bg-card px-6 py-16 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <ContentField
                  sourceId="pages.home"
                  path="services.eyebrow"
                  fallback={content.services.eyebrow}
                  className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
                />
                <ContentField
                  sourceId="pages.home"
                  path="services.title"
                  fallback={content.services.title}
                  as="h2"
                  className="font-heading text-foreground mt-3 text-4xl font-bold md:text-5xl"
                />
                <ContentField
                  sourceId="pages.home"
                  path="services.description"
                  fallback={content.services.description}
                  as="p"
                  className="text-muted-foreground mt-5 text-lg leading-relaxed"
                  multiline
                />
              </div>
              <div className="space-y-4">
                {(admin?.getFieldValue('pages.home', 'services.items') ?? content.services.items).map(
                  (service: string, index: number) => (
                    <div key={service}>
                      {admin?.isEditMode ? (
                        <textarea
                          value={service}
                          onChange={(event) => {
                            const items = [
                              ...((admin.getFieldValue('pages.home', 'services.items') ??
                                content.services.items) as string[]),
                            ];
                            items[index] = event.currentTarget.value;
                            admin.setFieldValue('pages.home', 'services.items', items);
                          }}
                          className="border-primary/40 bg-background/95 mb-3 w-full rounded-xl border px-3 py-2 outline-none"
                          rows={2}
                        />
                      ) : (
                        <p className="bg-background text-muted-foreground flex gap-3 rounded-2xl border border-border p-5 leading-relaxed">
                          <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                          {service}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {showSpecialties && (
            <section className="px-6 py-16 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div>
                    <ContentField
                      sourceId="pages.home"
                      path="specialties.eyebrow"
                      fallback={content.specialties.eyebrow}
                      className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
                    />
                    <ContentField
                      sourceId="pages.home"
                      path="specialties.title"
                      fallback={content.specialties.title}
                      as="h2"
                      className="font-heading text-foreground mt-3 text-4xl font-bold"
                    />
                  </div>
                  <a
                    href={withBase('/specialties')}
                    className="text-primary inline-flex items-center gap-2 font-bold"
                  >
                    <ContentField
                      sourceId="pages.home"
                      path="specialties.seeAllLabel"
                      fallback={content.specialties.seeAllLabel}
                    />
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {specialties.map((specialty) => (
                    <a
                      key={specialty.slug}
                      href={withBase(`/specialties/${specialty.slug}`)}
                      className="bg-card group rounded-[2rem] border border-border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <ShieldCheck className="text-primary mb-5 h-9 w-9" />
                      <h3 className="font-heading text-foreground text-2xl font-bold">
                        {specialty.title}
                      </h3>
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {specialty.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="from-secondary/30 to-primary/10 bg-gradient-to-br px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-[2rem] bg-card p-8 text-center shadow-sm md:p-12">
              <BookOpen className="text-primary mx-auto mb-5 h-12 w-12" />
              <ContentField
                sourceId="pages.home"
                path="cta.title"
                fallback={content.cta.title}
                as="h2"
                className="font-heading text-foreground text-4xl font-bold"
              />
              <ContentField
                sourceId="pages.home"
                path="cta.description"
                fallback={content.cta.description}
                as="p"
                className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed"
                multiline
              />
              <a
                href={consultationHref}
                target={siteConfig.pages.book.enabled ? bookLink.target : undefined}
                rel={siteConfig.pages.book.enabled ? bookLink.rel : undefined}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
              >
                {consultationLabel}
              </a>
            </div>
          </section>
        </main>
        <SiteFooter />
        <AdminSessionGate>{null}</AdminSessionGate>
      </div>
  );
}

export default function HomePage(props: HomePageProps) {
  return (
    <AdminProvider>
      <HomePageContent {...props} />
    </AdminProvider>
  );
}
