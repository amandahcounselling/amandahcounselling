import { withBase } from '../lib/paths';
import PageShell from './PageShell';

type PageUnavailableProps = {
  title: string;
};

export default function PageUnavailable({ title }: PageUnavailableProps) {
  return (
    <PageShell
      eyebrow="Not enabled"
      title={`${title} is turned off`}
      description="This page is disabled in the site configuration. Turn it back on in src/config/site.ts if you want it to display."
    >
      <section className="px-6 py-16 text-center lg:px-8">
        <a
          href={withBase('/')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
        >
          Return Home
        </a>
      </section>
    </PageShell>
  );
}
