import { Mail, Phone } from 'lucide-react';
import { siteConfig } from '../config';

type FormDisabledMessageProps = {
  context: 'contact' | 'booking';
};

export default function FormDisabledMessage({
  context,
}: FormDisabledMessageProps) {
  const title =
    context === 'booking'
      ? 'Please email to request a consultation'
      : 'Please email with your inquiry';
  const description =
    context === 'booking'
      ? `Online consultation requests are turned off right now. Please email ${siteConfig.practiceName} directly and include a brief note about what you are looking for, your availability, and the best way to reply.`
      : `Online contact forms are turned off right now. Please email ${siteConfig.practiceName} directly and include any details you would like to share.`;

  return (
    <div className="space-y-6 text-center">
      <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Mail className="text-primary h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <h2 className="font-heading text-foreground text-3xl font-bold">
          {title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={`mailto:${siteConfig.email}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {siteConfig.email}
        </a>
        <a
          href={`tel:${siteConfig.phone}`}
          className="border-primary text-primary hover:bg-primary/10 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-bold transition-colors"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {siteConfig.phone}
        </a>
      </div>
      <p className="text-muted-foreground text-sm">
        Typical response time: {siteConfig.responseTime}.
      </p>
    </div>
  );
}
