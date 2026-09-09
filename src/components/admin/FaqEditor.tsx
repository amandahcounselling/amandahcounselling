import { useAdmin } from '../../lib/admin/admin-context';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqEditor() {
  const admin = useAdmin();
  const items = (admin.getFieldValue('faq', 'items') ?? []) as FaqItem[];

  const updateItem = (index: number, patch: Partial<FaqItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    admin.setFieldValue('faq', 'items', next);
  };

  const addItem = () => {
    admin.setFieldValue('faq', 'items', [
      ...items,
      {
        id: `faq-${Date.now()}`,
        question: 'New question',
        answer: 'New answer',
      },
    ]);
  };

  const removeItem = (index: number) => {
    admin.setFieldValue(
      'faq',
      'items',
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={item.id} className="bg-card space-y-3 rounded-[2rem] border border-border p-6">
          <input
            value={item.question}
            onChange={(event) => updateItem(index, { question: event.currentTarget.value })}
            className="border-border bg-background w-full rounded-xl border px-4 py-3 font-bold outline-none"
          />
          <textarea
            value={item.answer}
            onChange={(event) => updateItem(index, { answer: event.currentTarget.value })}
            rows={4}
            className="border-border bg-background w-full rounded-xl border px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-sm font-bold text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex gap-3">
        <button type="button" onClick={addItem} className="rounded-full border border-border px-5 py-2 font-bold">
          Add FAQ
        </button>
        <button
          type="button"
          onClick={() => void admin.saveDirty()}
          disabled={admin.dirtySourceIds.length === 0 || admin.saveState === 'saving'}
          className="bg-primary text-primary-foreground rounded-full px-5 py-2 font-bold"
        >
          Save & publish
        </button>
      </div>
    </div>
  );
}
