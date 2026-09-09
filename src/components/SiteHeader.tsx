import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { getBookCtaLabel, navigationLinks, siteConfig } from '../config';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import SharedField from './admin/SharedField';

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const bookLink = getBookLinkProps();

  return (
    <header className="bg-background/90 border-border/70 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href={withBase('/')} className="text-foreground flex items-center gap-3">
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-bold">
            <SharedField path="practiceName" fallback={siteConfig.practiceName} />
          </span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navigationLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-primary text-sm font-bold transition-colors"
            >
              {item.label}
            </a>
          ))}
          {siteConfig.pages.book.enabled && (
            <a
              href={bookLink.href}
              target={bookLink.target}
              rel={bookLink.rel}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-bold shadow-sm transition-colors"
            >
              {getBookCtaLabel()}
            </a>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="border-border text-foreground rounded-full border p-2 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-border bg-background border-t px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navigationLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-primary py-2 font-bold transition-colors"
              >
                {item.label}
              </a>
            ))}
            {siteConfig.pages.book.enabled && (
              <a
                href={bookLink.href}
                target={bookLink.target}
                rel={bookLink.rel}
                onClick={() => setIsOpen(false)}
                className="bg-primary text-primary-foreground mt-2 rounded-full px-5 py-3 text-center font-bold"
              >
                {getBookCtaLabel()}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
