import { Settings2 } from 'lucide-react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';
import { withBase } from '../../lib/paths';

type SharedFieldProps = {
  sourceId?: string;
  path: string;
  fallback: unknown;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
};

export default function SharedField({
  sourceId = 'practice',
  path,
  fallback,
  as = 'span',
  className,
}: SharedFieldProps) {
  const admin = useOptionalAdmin();
  const value = admin?.getFieldValue(sourceId, path) ?? fallback;
  const Tag = as;

  return (
    <span className="group relative inline">
      <Tag className={className}>{String(value ?? '')}</Tag>
      {admin?.isEditMode && (
        <a
          href={withBase('/admin')}
          className="border-primary/30 bg-background text-primary ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold"
        >
          <Settings2 className="h-3 w-3" />
          Edit in Site Settings
        </a>
      )}
    </span>
  );
}

export function SharedFieldHint() {
  const admin = useOptionalAdmin();
  if (!admin?.isEditMode) return null;

  return (
    <a
      href={withBase('/admin')}
      className="border-primary/30 bg-background text-primary inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold"
    >
      <Settings2 className="h-3 w-3" />
      Edit in Site Settings
    </a>
  );
}
