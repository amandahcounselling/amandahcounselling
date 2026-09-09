import { useEffect } from 'react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';

type MarkdownEditorPanelProps = {
  repoPath: string;
  frontmatter: Record<string, unknown>;
  body: string;
};

export default function MarkdownEditorPanel({
  repoPath,
  frontmatter,
  body,
}: MarkdownEditorPanelProps) {
  const admin = useOptionalAdmin();

  useEffect(() => {
    admin?.registerMarkdownDraft(repoPath, frontmatter, body);
  }, [admin, body, frontmatter, repoPath]);

  if (!admin?.isEditMode) return null;

  const draft = admin.getMarkdownDraft(repoPath);
  if (!draft) return null;

  return (
    <div className="border-primary/30 bg-card/95 fixed inset-x-4 bottom-24 z-[90] max-h-[40vh] overflow-auto rounded-[2rem] border p-6 shadow-2xl">
      <h2 className="font-heading text-xl font-bold">Edit content</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {Object.entries(draft.frontmatter).map(([key, value]) => (
          <label key={key} className="block space-y-1">
            <span className="text-xs font-bold uppercase tracking-wide">{key}</span>
            <input
              value={String(value ?? '')}
              onChange={(event) => {
                admin.updateMarkdownDraft(
                  repoPath,
                  { ...draft.frontmatter, [key]: event.currentTarget.value },
                  draft.body,
                );
              }}
              className="border-border bg-background w-full rounded-xl border px-3 py-2 outline-none"
            />
          </label>
        ))}
      </div>
      <label className="mt-4 block space-y-1">
        <span className="text-xs font-bold uppercase tracking-wide">Body</span>
        <textarea
          value={draft.body}
          onChange={(event) => {
            admin.updateMarkdownDraft(repoPath, draft.frontmatter, event.currentTarget.value);
          }}
          rows={8}
          className="border-border bg-background w-full rounded-xl border px-3 py-2 outline-none"
        />
      </label>
    </div>
  );
}
