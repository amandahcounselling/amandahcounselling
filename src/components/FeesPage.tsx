import { CheckCircle } from 'lucide-react';
import { siteConfig } from '../config';
import { pageContent } from '../lib/content';
import { useOptionalAdmin } from '../lib/admin/admin-context';
import { formatSessionDuration } from '../lib/session';
import ContentField from './admin/ContentField';
import PageShell from './PageShell';

const content = pageContent.fees;

type SessionType = {
  label: string;
  durationMinutes: number;
  fee: string;
  description: string;
};

export default function FeesPage() {
  const admin = useOptionalAdmin();
  const feeItems = (admin?.getFieldValue('practice', 'forms.bookSession.sessionTypes') ??
    siteConfig.forms.bookSession.sessionTypes) as SessionType[];
  const insuranceNotes = (admin?.getFieldValue('practice', 'fees.insuranceNotes') ??
    siteConfig.fees.insuranceNotes) as string[];

  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="grid gap-6">
            {feeItems.map((item) => (
              <div
                key={item.label}
                className="bg-card grid gap-4 rounded-[2rem] border border-border p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <h2 className="font-heading text-foreground text-2xl font-bold">
                    {item.label}
                  </h2>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-2xl px-6 py-4 text-left md:text-right">
                  <p className="text-sm font-bold">
                    {formatSessionDuration(item.durationMinutes)}
                  </p>
                  <p className="font-heading text-3xl font-bold">{item.fee}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/10 rounded-[2rem] p-8">
            <ContentField
              sourceId="practice"
              path="fees.insuranceHeading"
              fallback={siteConfig.fees.insuranceHeading}
              as="h2"
              className="font-heading text-foreground text-3xl font-bold"
            />
            <div className="mt-6 grid gap-4">
              {insuranceNotes.map((note) => (
                <p
                  key={note}
                  className="text-muted-foreground flex gap-3 leading-relaxed"
                >
                  <CheckCircle className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  {note}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
