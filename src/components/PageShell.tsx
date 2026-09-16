import type { ReactNode } from 'react';
import { AdminProvider } from '../lib/admin/admin-context';
import { hasText } from '../lib/utils';
import AdminSessionGate from './admin/AdminSessionGate';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type PageShellProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  const showEyebrow = hasText(eyebrow);
  const showTitle = hasText(title);
  const showDescription = hasText(description);
  const showHero = showTitle || showDescription || showEyebrow;

  return (
    <AdminProvider>
      <div className="bg-background min-h-screen pb-24">
        <SiteHeader />
        <main>
          {showHero && (
            <section className="from-primary/10 via-background to-secondary/20 bg-gradient-to-br px-6 py-16 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                {showEyebrow && (
                  <p className="text-primary mb-3 text-sm font-bold uppercase tracking-[0.2em]">
                    {eyebrow}
                  </p>
                )}
                {showTitle && (
                  <h1 className="font-heading text-foreground text-4xl font-bold md:text-6xl">
                    {title}
                  </h1>
                )}
                {showDescription && (
                  <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </section>
          )}
          {children}
        </main>
        <SiteFooter />
        <AdminSessionGate>{null}</AdminSessionGate>
      </div>
    </AdminProvider>
  );
}
