import { useAdmin } from '../../lib/admin/admin-context';

type FieldConfig = {
  path: string;
  label: string;
  multiline?: boolean;
};

const groups: Array<{ title: string; fields: FieldConfig[] }> = [
  {
    title: 'Practice',
    fields: [
      { path: 'practiceName', label: 'Practice name' },
      { path: 'practitionerName', label: 'Practitioner name' },
      { path: 'credentials', label: 'Credentials' },
      { path: 'tagline', label: 'Tagline' },
      { path: 'description', label: 'Site description', multiline: true },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { path: 'location', label: 'Location' },
      { path: 'phone', label: 'Phone' },
      { path: 'email', label: 'Email' },
      { path: 'hours', label: 'Hours' },
      { path: 'responseTime', label: 'Response time' },
    ],
  },
  {
    title: 'Images',
    fields: [
      { path: 'heroImage', label: 'Home hero image path' },
      { path: 'aboutImage', label: 'About page image path' },
      { path: 'defaultImage', label: 'Default image path' },
    ],
  },
  {
    title: 'Navigation labels',
    fields: [
      { path: 'pages.home.label', label: 'Home' },
      { path: 'pages.about.label', label: 'About' },
      { path: 'pages.specialties.label', label: 'Specialties' },
      { path: 'pages.fees.label', label: 'Fees' },
      { path: 'pages.faq.label', label: 'FAQ' },
      { path: 'pages.book.label', label: 'Book page' },
      { path: 'pages.book.consultationLabel', label: 'Consultation tab' },
      { path: 'pages.blog.label', label: 'Blog' },
      { path: 'pages.contact.label', label: 'Contact' },
      { path: 'pages.privacy.label', label: 'Privacy' },
    ],
  },
  {
    title: 'Booking copy',
    fields: [
      { path: 'forms.bookSession.siteCtaLabel', label: 'Site CTA label' },
      { path: 'forms.bookSession.label', label: 'Session tab label' },
      { path: 'forms.bookSession.title', label: 'Session form title' },
      { path: 'forms.bookSession.description', label: 'Session description', multiline: true },
      {
        path: 'forms.bookSession.descriptionWithCalendar',
        label: 'Session description with calendar',
        multiline: true,
      },
      {
        path: 'forms.bookSession.confirmationMessage',
        label: 'Session confirmation message',
        multiline: true,
      },
      {
        path: 'forms.bookSession.consultationCopy.title',
        label: 'Consultation title',
      },
      {
        path: 'forms.bookSession.consultationCopy.description',
        label: 'Consultation description',
        multiline: true,
      },
      {
        path: 'forms.bookSession.consultationSuccessMessage',
        label: 'Consultation success message',
        multiline: true,
      },
      {
        path: 'forms.bookSession.externalLink.label',
        label: 'External booking button label',
      },
      {
        path: 'forms.bookSession.externalLink.description',
        label: 'External booking description',
        multiline: true,
      },
      {
        path: 'forms.bookSession.calendar.availabilityHelpText',
        label: 'Calendar help text',
        multiline: true,
      },
    ],
  },
  {
    title: 'Contact form copy',
    fields: [
      { path: 'forms.contactForm.nameLabel', label: 'Name label' },
      { path: 'forms.contactForm.emailLabel', label: 'Email label' },
      { path: 'forms.contactForm.messageLabel', label: 'Message label' },
      { path: 'forms.contactForm.submitLabel', label: 'Submit label' },
      { path: 'forms.contactForm.disclaimer', label: 'Disclaimer', multiline: true },
      { path: 'forms.contactForm.successTitle', label: 'Success title' },
      { path: 'forms.contactForm.successMessage', label: 'Success message', multiline: true },
      { path: 'forms.contactForm.successResetLabel', label: 'Send another label' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { path: 'footer.practiceHeading', label: 'Practice heading' },
      { path: 'footer.resourcesHeading', label: 'Resources heading' },
    ],
  },
];

export default function AdminSettingsForm() {
  const admin = useAdmin();
  const draft = admin.getJsonDraft('practice');

  if (!draft) return null;

  const sessionTypes = (draft.forms as { bookSession: { sessionTypes: Array<Record<string, unknown>> } })
    .bookSession.sessionTypes;
  const insuranceNotes = (draft.fees as { insuranceNotes: string[] }).insuranceNotes;

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.title} className="bg-card rounded-[2rem] border border-border p-8">
          <h2 className="font-heading text-2xl font-bold">{group.title}</h2>
          <div className="mt-6 grid gap-4">
            {group.fields.map((field) => {
              const value = String(admin.getFieldValue('practice', field.path) ?? '');
              const Component = field.multiline ? 'textarea' : 'input';
              return (
                <label key={field.path} className="block space-y-2">
                  <span className="text-sm font-bold">{field.label}</span>
                  <Component
                    value={value}
                    onChange={(event) =>
                      admin.setFieldValue('practice', field.path, event.currentTarget.value)
                    }
                    rows={field.multiline ? 4 : undefined}
                    className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                  />
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <section className="bg-card rounded-[2rem] border border-border p-8">
        <h2 className="font-heading text-2xl font-bold">Fees & session types</h2>
        <label className="mt-6 block space-y-2">
          <span className="text-sm font-bold">Insurance section heading</span>
          <input
            value={String(admin.getFieldValue('practice', 'fees.insuranceHeading') ?? '')}
            onChange={(event) =>
              admin.setFieldValue('practice', 'fees.insuranceHeading', event.currentTarget.value)
            }
            className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
          />
        </label>
        <div className="mt-6 space-y-4">
          {insuranceNotes.map((note, index) => (
            <textarea
              key={`note-${index}`}
              value={note}
              onChange={(event) => {
                const next = [...insuranceNotes];
                next[index] = event.currentTarget.value;
                admin.setFieldValue('practice', 'fees.insuranceNotes', next);
              }}
              rows={3}
              className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
            />
          ))}
        </div>
        <div className="mt-8 space-y-6">
          {sessionTypes.map((sessionType, index) => (
            <div key={`session-${index}`} className="space-y-3 rounded-2xl border border-border p-4">
              {(['label', 'fee', 'description'] as const).map((key) => (
                <label key={key} className="block space-y-2">
                  <span className="text-sm font-bold">{key}</span>
                  {key === 'description' ? (
                    <textarea
                      value={String(sessionType[key] ?? '')}
                      onChange={(event) => {
                        const next = [...sessionTypes];
                        next[index] = { ...sessionType, [key]: event.currentTarget.value };
                        admin.setFieldValue('practice', 'forms.bookSession.sessionTypes', next);
                      }}
                      rows={3}
                      className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                    />
                  ) : (
                    <input
                      value={String(sessionType[key] ?? '')}
                      onChange={(event) => {
                        const next = [...sessionTypes];
                        next[index] = { ...sessionType, [key]: event.currentTarget.value };
                        admin.setFieldValue('practice', 'forms.bookSession.sessionTypes', next);
                      }}
                      className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                    />
                  )}
                </label>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void admin.saveDirty()}
          disabled={admin.dirtySourceIds.length === 0 || admin.saveState === 'saving'}
          className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-bold"
        >
          {admin.saveState === 'saving' ? 'Saving…' : 'Save & publish'}
        </button>
        <button
          type="button"
          onClick={admin.discardDirty}
          className="rounded-full border border-border px-6 py-3 font-bold"
        >
          Discard
        </button>
      </div>
      {admin.saveError && <p className="text-sm text-red-700">{admin.saveError}</p>}
    </div>
  );
}
