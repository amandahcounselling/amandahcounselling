import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import type { PageSection } from '../content-data/pages.schema';
import { getBookCtaLabel, siteConfig } from '../config';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import { hasText } from '../lib/utils';
import { useOptionalAdmin } from '../lib/admin/admin-context';
import ContentField, { ContentCardList } from './admin/ContentField';
import ImageField from './admin/ImageField';
import SharedField from './admin/SharedField';
import MarkdownText from './MarkdownText';

export type PageSectionSpecialty = {
  slug: string;
  title: string;
  description: string;
};

type PageSectionsProps = {
  sourceId: string;
  sections: PageSection[];
  specialties?: PageSectionSpecialty[];
  /** Compact stacked prose inside a single card (privacy-style pages). */
  variant?: 'default' | 'article';
};

const cardIcons = [HeartHandshake, ShieldCheck, Award] as const;

function sectionPath(index: number, field: string) {
  return `sections.${index}.${field}`;
}

function HeroSection({
  sourceId,
  section,
  index,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'hero' }>;
  index: number;
}) {
  const bookLink = getBookLinkProps();
  const consultationHref = siteConfig.pages.book.enabled
    ? bookLink.href
    : withBase(siteConfig.pages.contact.href);
  const consultationLabel = siteConfig.pages.book.enabled
    ? getBookCtaLabel()
    : siteConfig.pages.contact.label;

  return (
    <section className="from-primary/10 via-background to-secondary/20 bg-gradient-to-br px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'eyebrow')}
              fallback={section.eyebrow}
              className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
            />
            <h1 className="font-heading text-foreground text-5xl font-bold leading-tight md:text-7xl">
              <SharedField path="tagline" fallback={siteConfig.tagline} />
            </h1>
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'subtitle')}
              fallback={section.subtitle}
              as="p"
              className="text-muted-foreground max-w-2xl text-xl leading-relaxed"
              multiline
              markdown
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
            {siteConfig.pages.specialties.enabled && hasText(section.specialtiesCta) && (
              <a
                href={withBase('/specialties')}
                className="border-primary text-primary hover:bg-primary/10 inline-flex items-center justify-center rounded-full border px-6 py-3 font-bold transition-colors"
              >
                <ContentField
                  sourceId={sourceId}
                  path={sectionPath(index, 'specialtiesCta')}
                  fallback={section.specialtiesCta}
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
  );
}

function ProseSection({
  sourceId,
  section,
  index,
  compact = false,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'prose' }>;
  index: number;
  compact?: boolean;
}) {
  const titleClass = compact
    ? 'font-heading text-foreground text-2xl font-bold'
    : 'font-heading text-foreground text-4xl font-bold';
  const bodyClass = compact
    ? 'text-muted-foreground leading-relaxed'
    : 'text-muted-foreground text-lg leading-relaxed';
  const showTitle = hasText(section.title);
  const visibleParagraphs = section.paragraphs
    .map((paragraph, paragraphIndex) => ({ paragraph, paragraphIndex }))
    .filter(({ paragraph }) => hasText(paragraph));

  if (!showTitle && visibleParagraphs.length === 0 && !section.withImage) {
    return null;
  }

  const paragraphs = (
    <>
      {showTitle && (
        <ContentField
          sourceId={sourceId}
          path={sectionPath(index, 'title')}
          fallback={section.title}
          as="h2"
          className={titleClass}
        />
      )}
      {visibleParagraphs.map(({ paragraph, paragraphIndex }) => (
        <ContentField
          key={`${index}-${paragraphIndex}`}
          sourceId={sourceId}
          path={sectionPath(index, `paragraphs.${paragraphIndex}`)}
          fallback={paragraph}
          as="p"
          className={bodyClass}
          multiline
          markdown
        />
      ))}
    </>
  );

  if (section.withImage) {
    return (
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <ImageField
            path="aboutImage"
            fallback={siteConfig.aboutImage}
            fieldKey="about"
            wrapperClassName="lg:sticky lg:top-28"
            className="aspect-[4/5] w-full rounded-[3rem] object-cover object-top shadow-lg"
          />
          <div className="space-y-6">
            <SharedField
              path="credentials"
              fallback={siteConfig.credentials}
              className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
            />
            {paragraphs}
          </div>
        </div>
      </section>
    );
  }

  if (compact) {
    return <div className="space-y-3">{paragraphs}</div>;
  }

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">{paragraphs}</div>
    </section>
  );
}

function CardsSection({
  sourceId,
  section,
  index,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'cards' }>;
  index: number;
}) {
  const showEyebrow = hasText(section.eyebrow);
  const showTitle = hasText(section.title);
  const showDescription = hasText(section.description);
  const showHeader = showEyebrow || showTitle || showDescription;

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {showHeader && (
          <div className="mx-auto max-w-3xl text-center">
            {showEyebrow && (
              <ContentField
                sourceId={sourceId}
                path={sectionPath(index, 'eyebrow')}
                fallback={section.eyebrow}
                className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
              />
            )}
            {showTitle && (
              <ContentField
                sourceId={sourceId}
                path={sectionPath(index, 'title')}
                fallback={section.title}
                as="h2"
                className={`font-heading text-foreground text-4xl font-bold md:text-5xl ${showEyebrow ? 'mt-3' : ''}`}
              />
            )}
            {showDescription && (
              <ContentField
                sourceId={sourceId}
                path={sectionPath(index, 'description')}
                fallback={section.description}
                as="p"
                className="text-muted-foreground mt-4 text-lg leading-relaxed"
                multiline
                markdown
              />
            )}
          </div>
        )}

        <div className={`grid gap-6 md:grid-cols-3 ${showHeader ? 'mt-12' : ''}`}>
          <ContentCardList
            sourceId={sourceId}
            path={sectionPath(index, 'items')}
            fallback={section.items}
            renderItem={(item, itemIndex) => {
              const Icon = cardIcons[itemIndex % cardIcons.length];
              return (
                <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
                  <Icon className="text-primary mb-5 h-9 w-9" />
                  {hasText(item.title) && (
                    <h3 className="font-heading text-foreground text-2xl font-bold">
                      {item.title}
                    </h3>
                  )}
                  {hasText(item.description) && (
                    <MarkdownText className="text-muted-foreground mt-3 leading-relaxed">
                      {item.description}
                    </MarkdownText>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}

function BulletsSection({
  sourceId,
  section,
  index,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'bullets' }>;
  index: number;
}) {
  const admin = useOptionalAdmin();
  const items = (admin?.getFieldValue(sourceId, sectionPath(index, 'items')) ??
    section.items) as string[];
  const showEyebrow = hasText(section.eyebrow);
  const showTitle = hasText(section.title);
  const showDescription = hasText(section.description);
  const visibleItems = admin?.isEditMode
    ? items.map((item, itemIndex) => ({ item, itemIndex }))
    : items
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter(({ item }) => hasText(item));

  return (
    <section className="bg-card px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          {showEyebrow && (
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'eyebrow')}
              fallback={section.eyebrow}
              className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
            />
          )}
          {showTitle && (
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'title')}
              fallback={section.title}
              as="h2"
              className={`font-heading text-foreground text-4xl font-bold md:text-5xl ${showEyebrow ? 'mt-3' : ''}`}
            />
          )}
          {showDescription && (
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'description')}
              fallback={section.description}
              as="p"
              className="text-muted-foreground mt-5 text-lg leading-relaxed"
              multiline
              markdown
            />
          )}
        </div>
        <div className="space-y-4">
          {visibleItems.map(({ item, itemIndex }) => (
            <div key={`${index}-${itemIndex}`}>
              {admin?.isEditMode ? (
                <textarea
                  value={item}
                  onChange={(event) => {
                    const next = [...items];
                    next[itemIndex] = event.currentTarget.value;
                    admin.setFieldValue(sourceId, sectionPath(index, 'items'), next);
                  }}
                  className="border-primary/40 bg-background/95 mb-3 w-full rounded-xl border px-3 py-2 outline-none"
                  rows={2}
                />
              ) : (
                <div className="bg-background text-muted-foreground flex gap-3 rounded-2xl border border-border p-5 leading-relaxed">
                  <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <MarkdownText>{item}</MarkdownText>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialtiesPreviewSection({
  sourceId,
  section,
  index,
  specialties,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'specialtiesPreview' }>;
  index: number;
  specialties: PageSectionSpecialty[];
}) {
  if (!siteConfig.pages.specialties.enabled || specialties.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'eyebrow')}
              fallback={section.eyebrow}
              className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
            />
            <ContentField
              sourceId={sourceId}
              path={sectionPath(index, 'title')}
              fallback={section.title}
              as="h2"
              className="font-heading text-foreground mt-3 text-4xl font-bold"
            />
          </div>
          {hasText(section.seeAllLabel) && (
            <a
              href={withBase('/specialties')}
              className="text-primary inline-flex items-center gap-2 font-bold"
            >
              <ContentField
                sourceId={sourceId}
                path={sectionPath(index, 'seeAllLabel')}
                fallback={section.seeAllLabel}
              />
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
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
  );
}

function CtaSection({
  sourceId,
  section,
  index,
}: {
  sourceId: string;
  section: Extract<PageSection, { type: 'cta' }>;
  index: number;
}) {
  const bookLink = getBookLinkProps();
  const consultationHref = siteConfig.pages.book.enabled
    ? bookLink.href
    : withBase(siteConfig.pages.contact.href);
  const consultationLabel = siteConfig.pages.book.enabled
    ? getBookCtaLabel()
    : siteConfig.pages.contact.label;
  const showTitle = hasText(section.title);
  const showDescription = hasText(section.description);

  if (!showTitle && !showDescription) {
    return null;
  }

  return (
    <section className="from-secondary/30 to-primary/10 bg-gradient-to-br px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-card p-8 text-center shadow-sm md:p-12">
        <BookOpen className="text-primary mx-auto mb-5 h-12 w-12" />
        {showTitle && (
          <ContentField
            sourceId={sourceId}
            path={sectionPath(index, 'title')}
            fallback={section.title}
            as="h2"
            className="font-heading text-foreground text-4xl font-bold"
          />
        )}
        {showDescription && (
          <ContentField
            sourceId={sourceId}
            path={sectionPath(index, 'description')}
            fallback={section.description}
            as="p"
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed"
            multiline
            markdown
          />
        )}
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
  );
}

export default function PageSections({
  sourceId,
  sections,
  specialties = [],
  variant = 'default',
}: PageSectionsProps) {
  const compact = variant === 'article';

  const rendered = sections.map((section, index) => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
          />
        );
      case 'prose':
        return (
          <ProseSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
            compact={compact}
          />
        );
      case 'cards':
        return (
          <CardsSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
          />
        );
      case 'bullets':
        return (
          <BulletsSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
          />
        );
      case 'specialtiesPreview':
        return (
          <SpecialtiesPreviewSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
            specialties={specialties}
          />
        );
      case 'cta':
        return (
          <CtaSection
            key={`section-${index}`}
            sourceId={sourceId}
            section={section}
            index={index}
          />
        );
      default:
        return null;
    }
  });

  if (compact) {
    return <div className="space-y-8">{rendered}</div>;
  }

  return <>{rendered}</>;
}
