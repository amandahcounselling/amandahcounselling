import { CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { getBookCtaLabel, isPhoneEnabled, siteConfig } from '../config';
import { pageContent } from '../lib/content';
import { getBookLinkProps, isExternalBookingEnabled } from '../lib/booking';
import { getFormSettings, getFormSubject } from '../lib/forms';
import ContentField from './admin/ContentField';
import SharedField from './admin/SharedField';
import CaptchaField from './CaptchaField';
import FormDisabledMessage from './FormDisabledMessage';
import PageShell from './PageShell';

const content = pageContent.contact;
const formCopy = siteConfig.forms.contactForm;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const formSettings = getFormSettings('contact');
  const bookLink = getBookLinkProps();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!formSettings.isDemo) {
      return;
    }

    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  const bookingMessage = isExternalBookingEnabled()
    ? content.sidebar.bookingExternal
    : siteConfig.forms.bookSession.enabled
      ? content.sidebar.bookingSession
      : content.sidebar.bookingConsultation;

  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
              <ContentField
                sourceId="pages.contact"
                path="sidebar.detailsHeading"
                fallback={content.sidebar.detailsHeading}
                as="h2"
                className="font-heading text-foreground text-3xl font-bold"
              />
              <div className="text-muted-foreground mt-6 space-y-4">
                <p className="flex gap-3">
                  <MapPin className="text-primary mt-1 h-5 w-5" />
                  <SharedField path="location" fallback={siteConfig.location} />
                </p>
                <p className="flex gap-3">
                  <Mail className="text-primary mt-1 h-5 w-5" />
                  <a href={`mailto:${siteConfig.email}`}>
                    <SharedField path="email" fallback={siteConfig.email} />
                  </a>
                </p>
                {isPhoneEnabled() && (
                  <p className="flex gap-3">
                    <Phone className="text-primary mt-1 h-5 w-5" />
                    <a href={`tel:${siteConfig.phone}`}>
                      <SharedField path="phone" fallback={siteConfig.phone} />
                    </a>
                  </p>
                )}
              </div>
            </div>

            {siteConfig.pages.book.enabled && (
              <div className="bg-secondary text-secondary-foreground rounded-[2rem] p-8">
                <ContentField
                  sourceId="pages.contact"
                  path="sidebar.bookingHeading"
                  fallback={content.sidebar.bookingHeading}
                  as="h2"
                  className="font-heading text-2xl font-bold"
                />
                <p className="mt-3 leading-relaxed">{bookingMessage}</p>
                <a
                  href={bookLink.href}
                  target={bookLink.target}
                  rel={bookLink.rel}
                  className="bg-background text-foreground mt-5 inline-flex rounded-full px-5 py-3 font-bold"
                >
                  {getBookCtaLabel()}
                </a>
              </div>
            )}
          </aside>

          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm md:p-8">
            {formSettings.hidesForm ? (
              <FormDisabledMessage context="contact" />
            ) : submitted ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="text-primary mx-auto h-14 w-14" />
                <h2 className="font-heading text-foreground text-3xl font-bold">
                  {formCopy.successTitle}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {formCopy.successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="border-primary text-primary hover:bg-primary/10 rounded-full border px-6 py-3 font-bold"
                >
                  {formCopy.successResetLabel}
                </button>
              </div>
            ) : (
              <form
                action={formSettings.action || undefined}
                method="post"
                data-basin-form={
                  formSettings.backend === 'usebasin' ? '' : undefined
                }
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <input type="hidden" name="formKind" value="contact" />
                <input type="hidden" name="formLabel" value="Contact" />
                <input type="hidden" name="_subject" value={getFormSubject('contact')} />
                <input type="hidden" name="provider" value={formSettings.backend} />
                <label className="space-y-2">
                  <span className="text-foreground text-sm font-bold">{formCopy.nameLabel}</span>
                  <input
                    name="name"
                    required
                    className="border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-3 outline-none transition-colors"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-foreground text-sm font-bold">{formCopy.emailLabel}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-3 outline-none transition-colors"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-foreground text-sm font-bold">
                    {formCopy.messageLabel}
                  </span>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    className="border-border bg-background focus:border-primary w-full resize-none rounded-xl border px-4 py-3 outline-none transition-colors"
                  />
                </label>
                <CaptchaField captcha={formSettings.captcha} />
                <p>{formCopy.disclaimer}</p>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
                >
                  {formCopy.submitLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
