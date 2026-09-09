import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { contentData, pageContent } from '../lib/content';
import { useOptionalAdmin } from '../lib/admin/admin-context';
import PageShell from './PageShell';

const shell = pageContent.faq;

export default function FaqPage() {
  const admin = useOptionalAdmin();
  const faqs = (admin?.getFieldValue('faq', 'items') ?? contentData.faq.items) as Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <PageShell
      eyebrow={shell.shell.eyebrow}
      title={shell.shell.title}
      description={shell.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-card overflow-hidden rounded-2xl border border-border shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="hover:bg-secondary/20 flex w-full items-start justify-between gap-4 p-6 text-left transition-colors"
                >
                  <span className="font-heading text-foreground text-xl font-bold">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`text-primary mt-1 h-5 w-5 flex-shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <p className="text-muted-foreground border-border border-t p-6 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
