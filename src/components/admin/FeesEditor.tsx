import { useAdmin } from '../../lib/admin/admin-context';

type SessionType = {
  label: string;
  durationMinutes: number;
  fee: string;
  description: string;
  modes: Array<'virtual' | 'in_person'>;
  kind: 'consultation' | 'session';
};

export default function FeesEditor() {
  const admin = useAdmin();
  const sessionTypes = (admin.getFieldValue('practice', 'forms.bookSession.sessionTypes') ??
    []) as SessionType[];
  const insuranceNotes = (admin.getFieldValue('practice', 'fees.insuranceNotes') ?? []) as string[];
  const insuranceHeading = String(
    admin.getFieldValue('practice', 'fees.insuranceHeading') ?? 'Insurance and payment',
  );

  const updateSessionType = (index: number, patch: Partial<SessionType>) => {
    const next = [...sessionTypes];
    next[index] = { ...next[index], ...patch };
    admin.setFieldValue('practice', 'forms.bookSession.sessionTypes', next);
  };

  const addSessionType = () => {
    admin.setFieldValue('practice', 'forms.bookSession.sessionTypes', [
      ...sessionTypes,
      {
        label: 'New service',
        durationMinutes: 50,
        fee: '$0',
        description: 'Describe this service.',
        modes: ['virtual', 'in_person'],
        kind: 'session',
      },
    ]);
  };

  const removeSessionType = (index: number) => {
    admin.setFieldValue(
      'practice',
      'forms.bookSession.sessionTypes',
      sessionTypes.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const updateInsuranceNote = (index: number, value: string) => {
    const next = [...insuranceNotes];
    next[index] = value;
    admin.setFieldValue('practice', 'fees.insuranceNotes', next);
  };

  const addInsuranceNote = () => {
    admin.setFieldValue('practice', 'fees.insuranceNotes', [...insuranceNotes, 'New note']);
  };

  const removeInsuranceNote = (index: number) => {
    admin.setFieldValue(
      'practice',
      'fees.insuranceNotes',
      insuranceNotes.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Services and rates</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            These appear on the Fees page and in booking session options.
          </p>
        </div>

        {sessionTypes.map((item, index) => (
          <div key={`${item.label}-${index}`} className="bg-card space-y-3 rounded-[2rem] border border-border p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-bold">Service name</span>
                <input
                  value={item.label}
                  onChange={(event) => updateSessionType(index, { label: event.currentTarget.value })}
                  className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold">Fee</span>
                <input
                  value={item.fee}
                  onChange={(event) => updateSessionType(index, { fee: event.currentTarget.value })}
                  className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-bold">Duration (minutes)</span>
                <input
                  type="number"
                  min={1}
                  value={item.durationMinutes}
                  onChange={(event) =>
                    updateSessionType(index, {
                      durationMinutes: Number.parseInt(event.currentTarget.value, 10) || 0,
                    })
                  }
                  className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold">Type</span>
                <select
                  value={item.kind}
                  onChange={(event) =>
                    updateSessionType(index, {
                      kind: event.currentTarget.value as SessionType['kind'],
                    })
                  }
                  className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
                >
                  <option value="consultation">Consultation</option>
                  <option value="session">Session</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-bold">Description</span>
              <textarea
                value={item.description}
                onChange={(event) =>
                  updateSessionType(index, { description: event.currentTarget.value })
                }
                rows={3}
                className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => removeSessionType(index)}
              className="text-sm font-bold text-red-700"
            >
              Remove service
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSessionType}
          className="rounded-full border border-border px-5 py-2 font-bold"
        >
          Add service
        </button>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Insurance and payment</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Heading and bullet points shown below the service list on the Fees page.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-bold">Section heading</span>
          <input
            value={insuranceHeading}
            onChange={(event) =>
              admin.setFieldValue('practice', 'fees.insuranceHeading', event.currentTarget.value)
            }
            className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
          />
        </label>

        {insuranceNotes.map((note, index) => (
          <div key={`${note}-${index}`} className="bg-card space-y-3 rounded-[2rem] border border-border p-6">
            <textarea
              value={note}
              onChange={(event) => updateInsuranceNote(index, event.currentTarget.value)}
              rows={3}
              className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
            />
            <button
              type="button"
              onClick={() => removeInsuranceNote(index)}
              className="text-sm font-bold text-red-700"
            >
              Remove note
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addInsuranceNote}
          className="rounded-full border border-border px-5 py-2 font-bold"
        >
          Add note
        </button>
      </section>

      <button
        type="button"
        onClick={() => void admin.saveDirty()}
        disabled={admin.dirtySourceIds.length === 0 || admin.saveState === 'saving'}
        className="bg-primary text-primary-foreground rounded-full px-5 py-2 font-bold"
      >
        Save & publish
      </button>
    </div>
  );
}
