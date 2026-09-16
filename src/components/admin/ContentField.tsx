import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';
import { hasText } from '../../lib/utils';
import MarkdownText from '../MarkdownText';

type ContentFieldProps = {
  sourceId: string;
  path: string;
  fallback: unknown;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
  multiline?: boolean;
  /** Render the value as markdown (bold, italics, lists, links). Ignored in edit mode. */
  markdown?: boolean;
};

export default function ContentField({
  sourceId,
  path,
  fallback,
  as = 'span',
  className,
  multiline = false,
  markdown = false,
}: ContentFieldProps) {
  const admin = useOptionalAdmin();
  const value = admin?.getFieldValue(sourceId, path) ?? fallback;
  const display = String(value ?? '');

  if (admin?.isEditMode) {
    const Component = multiline ? 'textarea' : 'input';
    return (
      <Component
        value={display}
        onChange={(event) => admin.setFieldValue(sourceId, path, event.currentTarget.value)}
        className={`border-primary/40 bg-background/95 w-full rounded-xl border px-3 py-2 outline-none ${className ?? ''}`}
        rows={multiline ? 4 : undefined}
      />
    );
  }

  if (!hasText(display)) {
    return null;
  }

  if (markdown) {
    return <MarkdownText className={className}>{display}</MarkdownText>;
  }

  const Tag = as;
  return <Tag className={className}>{display}</Tag>;
}

type ContentListProps = {
  sourceId: string;
  path: string;
  fallback: string[];
  className?: string;
  itemClassName?: string;
  markdown?: boolean;
};

export function ContentStringList({
  sourceId,
  path,
  fallback,
  className,
  itemClassName,
  markdown = false,
}: ContentListProps) {
  const admin = useOptionalAdmin();
  const value = (admin?.getFieldValue(sourceId, path) ?? fallback) as string[];

  if (admin?.isEditMode) {
    return (
      <div className={className}>
        {value.map((item, index) => (
          <textarea
            key={`${path}-${index}`}
            value={item}
            onChange={(event) => {
              const next = [...value];
              next[index] = event.currentTarget.value;
              admin.setFieldValue(sourceId, path, next);
            }}
            className="border-primary/40 bg-background/95 mb-3 w-full rounded-xl border px-3 py-2 outline-none"
            rows={2}
          />
        ))}
      </div>
    );
  }

  const visible = value.filter((item) => hasText(item));
  if (visible.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {visible.map((item) =>
        markdown ? (
          <MarkdownText key={item} className={itemClassName}>
            {item}
          </MarkdownText>
        ) : (
          <p key={item} className={itemClassName}>
            {item}
          </p>
        ),
      )}
    </div>
  );
}

type ContentCardsProps = {
  sourceId: string;
  path: string;
  fallback: Array<{ title: string; description: string }>;
  renderItem: (item: { title: string; description: string }, index: number) => ReactNode;
};

export function ContentCardList({ sourceId, path, fallback, renderItem }: ContentCardsProps) {
  const admin = useOptionalAdmin();
  const value = (admin?.getFieldValue(sourceId, path) ?? fallback) as Array<{
    title: string;
    description: string;
  }>;

  if (admin?.isEditMode) {
    return (
      <div className="space-y-4">
        {value.map((item, index) => (
          <div key={`${path}-${index}`} className="space-y-2 rounded-2xl border border-border p-4">
            <input
              value={item.title}
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...item, title: event.currentTarget.value };
                admin.setFieldValue(sourceId, path, next);
              }}
              className="border-primary/40 bg-background/95 w-full rounded-xl border px-3 py-2 outline-none"
            />
            <textarea
              value={item.description}
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...item, description: event.currentTarget.value };
                admin.setFieldValue(sourceId, path, next);
              }}
              className="border-primary/40 bg-background/95 w-full rounded-xl border px-3 py-2 outline-none"
              rows={3}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {value.map((item, index) => (
        <Fragment key={`${path}-${index}`}>{renderItem(item, index)}</Fragment>
      ))}
    </>
  );
}
