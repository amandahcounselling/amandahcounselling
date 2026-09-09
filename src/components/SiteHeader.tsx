import { Heart, Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { getBookCtaLabel, navigationLinks, siteConfig } from '../config';
import { useOptionalAdmin } from '../lib/admin/admin-context';
import { getBookLinkProps } from '../lib/booking';
import { withBase } from '../lib/paths';
import SharedField from './admin/SharedField';

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bookLink = getBookLinkProps();
  const admin = useOptionalAdmin();
  const logo = String(admin?.getFieldValue('practice', 'logo') ?? siteConfig.logo ?? '').trim();
  const practiceName = String(
    admin?.getFieldValue('practice', 'practiceName') ?? siteConfig.practiceName,
  );

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !admin) return;

    setUploading(true);
    setUploadError('');
    try {
      await admin.uploadImage(file, 'logo', { sourceId: 'practice', fieldPath: 'logo' });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <header className="bg-background/90 border-border/70 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <a href={withBase('/')} className="text-foreground flex items-center gap-3">
            {logo ? (
              <img
                src={withBase(logo)}
                alt={practiceName}
                className="h-10 w-auto max-w-[12rem] object-contain"
              />
            ) : (
              <>
                <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-xl font-bold">
                  <SharedField path="practiceName" fallback={siteConfig.practiceName} />
                </span>
              </>
            )}
          </a>
          {logo && admin?.isEditMode && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border-primary/30 bg-background text-primary rounded-full border px-2 py-0.5 text-xs font-bold"
              >
                {uploading ? 'Uploading…' : 'Replace logo'}
              </button>
              {uploadError && <p className="text-xs text-red-700">{uploadError}</p>}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
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
