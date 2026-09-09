import { Mail, MapPin, Phone } from 'lucide-react';
import { getBookCtaLabel, siteConfig } from '../config';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import SharedField from './admin/SharedField';

export default function SiteFooter() {
  const bookLink = getBookLinkProps();
  const practiceLinks = [
    siteConfig.pages.about,
    siteConfig.pages.specialties,
    siteConfig.pages.fees,
    siteConfig.pages.book,
  ].filter((page) => page.enabled);

  const resourceLinks = [
    siteConfig.pages.faq,
    siteConfig.pages.blog,
    siteConfig.pages.contact,
    siteConfig.pages.privacy,
  ].filter((page) => page.enabled);

  return (
    <footer className="bg-card border-border/70 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <h2 className="font-heading text-foreground text-2xl font-bold">
            <SharedField path="practiceName" fallback={siteConfig.practiceName} />
          </h2>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            <SharedField path="tagline" fallback={siteConfig.tagline} />
          </p>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="text-primary h-4 w-4" aria-hidden="true" />
              <SharedField path="location" fallback={siteConfig.location} />
            </p>
            <p className="flex items-center gap-2">
              <Mail className="text-primary h-4 w-4" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`}>
                <SharedField path="email" fallback={siteConfig.email} />
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="text-primary h-4 w-4" aria-hidden="true" />
              <a href={`tel:${siteConfig.phone}`}>
                <SharedField path="phone" fallback={siteConfig.phone} />
              </a>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-foreground mb-4 font-bold">{siteConfig.footer.practiceHeading}</h3>
          <ul className="space-y-3">
            {practiceLinks.map((link) => {
              const isBookLink = link.href === siteConfig.pages.book.href;

              return (
                <li key={link.href}>
                  <a
                    href={isBookLink ? bookLink.href : withBase(link.href)}
                    target={isBookLink ? bookLink.target : undefined}
                    rel={isBookLink ? bookLink.rel : undefined}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isBookLink ? getBookCtaLabel() : link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-foreground mb-4 font-bold">{siteConfig.footer.resourcesHeading}</h3>
          <ul className="space-y-3">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={withBase(link.href)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-border/70 border-t px-6 py-5 text-center text-sm text-muted-foreground">
        (c) {new Date().getFullYear()}{' '}
        <SharedField path="practiceName" fallback={siteConfig.practiceName} />. All rights
        reserved.
      </div>
    </footer>
  );
}
