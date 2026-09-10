import { Heart, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getBookCtaLabel, navigationLinks, siteConfig } from '../config';
import { useOptionalAdmin } from '../lib/admin/admin-context';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import SharedField from './admin/SharedField';

const SCROLL_COMPACT_AT = 48;

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bookLink = getBookLinkProps();
  const admin = useOptionalAdmin();
  const logo = String(admin?.getFieldValue('practice', 'logo') ?? siteConfig.logo ?? '').trim();
  const logoMark = String(
    admin?.getFieldValue('practice', 'logoMark') ?? siteConfig.logoMark ?? '',
  ).trim();
  const practiceName = String(
    admin?.getFieldValue('practice', 'practiceName') ?? siteConfig.practiceName,
  );
  const canShrink = Boolean(logo || logoMark);

  useEffect(() => {
    if (!canShrink) {
      setCompact(false);
      return;
    }

    const update = () => setCompact(window.scrollY > SCROLL_COMPACT_AT);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [canShrink]);

  const handleMarkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !admin) return;

    setUploading(true);
    setUploadError('');
    try {
      await admin.uploadImage(file, 'logoMark', {
        sourceId: 'practice',
        fieldPath: 'logoMark',
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const showExpandedWordmark = Boolean(logo) && !compact;
  const showCompactMark = Boolean(logoMark) && (compact || !logo);
  const showNameFallback = !logo && !compact;

  return (
    <header className="bg-background/90 border-border/70 sticky top-0 z-50 border-b backdrop-blur">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:px-8 ${
          compact ? 'py-2' : 'py-4'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={withBase('/')}
            className="text-foreground flex min-w-0 items-center gap-3"
            aria-label={practiceName}
          >
            {logo ? (
              <img
                src={withBase(logo)}
                alt={showExpandedWordmark ? practiceName : ''}
                aria-hidden={!showExpandedWordmark}
                className={`origin-left object-contain object-left transition-all duration-300 ease-out motion-reduce:transition-none ${
                  showExpandedWordmark
                    ? 'h-16 w-auto max-w-[min(18rem,72vw)] opacity-100 sm:h-20 sm:max-w-[22rem] md:h-[5.5rem]'
                    : 'pointer-events-none max-h-0 max-w-0 opacity-0'
                }`}
              />
            ) : null}

            {logoMark ? (
              <img
                src={withBase(logoMark)}
                alt={showCompactMark && !showExpandedWordmark ? practiceName : ''}
                aria-hidden={!(showCompactMark && !showExpandedWordmark)}
                className={`shrink-0 object-contain transition-all duration-300 ease-out motion-reduce:transition-none ${
                  showCompactMark
                    ? 'h-9 w-auto opacity-100 sm:h-10'
                    : 'pointer-events-none h-0 w-0 opacity-0'
                }`}
              />
            ) : compact && logo ? (
              <img
                src={withBase(logo)}
                alt={practiceName}
                className="h-9 w-auto max-w-[8rem] object-contain object-left sm:h-10"
              />
            ) : !logo && !logoMark ? (
              <span className="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <Heart className="h-4 w-4" aria-hidden="true" />
              </span>
            ) : null}

            {showNameFallback ? (
              <span className="font-heading truncate text-lg font-bold sm:text-xl">
                <SharedField path="practiceName" fallback={siteConfig.practiceName} />
              </span>
            ) : null}
          </a>

          {logoMark && admin?.isEditMode && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border-primary/30 bg-background text-primary rounded-full border px-2 py-0.5 text-xs font-bold"
              >
                {uploading ? 'Uploading…' : 'Replace mark'}
              </button>
              {uploadError && <p className="text-xs text-red-700">{uploadError}</p>}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMarkUpload}
              />
            </div>
          )}
        </div>

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
