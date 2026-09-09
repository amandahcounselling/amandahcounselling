import { z } from 'zod';

export type FieldScope = 'page' | 'site';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'string-list'
  | 'object-list';

export type FieldMeta = {
  type: FieldType;
  label: string;
  scope: FieldScope;
  group?: string;
};

export type FieldDefinition = {
  schema: z.ZodTypeAny;
  meta: FieldMeta;
};

export function fieldText(meta: Omit<FieldMeta, 'type'> & { type?: 'text' }) {
  return {
    schema: z.string(),
    meta: { ...meta, type: 'text' as const },
  };
}

export function fieldTextarea(meta: Omit<FieldMeta, 'type'>) {
  return {
    schema: z.string(),
    meta: { ...meta, type: 'textarea' as const },
  };
}

export function fieldImage(meta: Omit<FieldMeta, 'type'>) {
  return {
    schema: z.string(),
    meta: { ...meta, type: 'image' as const },
  };
}

export function fieldStringList(meta: Omit<FieldMeta, 'type'>) {
  return {
    schema: z.array(z.string()),
    meta: { ...meta, type: 'string-list' as const },
  };
}

export function defineContentSchema<T extends Record<string, FieldDefinition | Record<string, unknown>>>(
  shape: T,
): { schema: z.ZodObject<z.ZodRawShape>; fields: Record<string, FieldMeta> } {
  const zodShape: z.ZodRawShape = {};
  const fields: Record<string, FieldMeta> = {};

  for (const [key, value] of Object.entries(shape)) {
    if (value && typeof value === 'object' && 'schema' in value && 'meta' in value) {
      const def = value as FieldDefinition;
      zodShape[key] = def.schema;
      fields[key] = def.meta;
    } else if (value && typeof value === 'object') {
      const nested = defineContentSchema(value as Record<string, FieldDefinition>);
      zodShape[key] = nested.schema;
      for (const [nestedKey, nestedMeta] of Object.entries(nested.fields)) {
        fields[`${key}.${nestedKey}`] = nestedMeta;
      }
    }
  }

  return { schema: z.object(zodShape), fields };
}

export function getByPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null) {
      return undefined;
    }
    if (Array.isArray(current)) {
      return current[Number(segment)];
    }
    if (typeof current === 'object') {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, value);
}

export function setByPath(
  value: Record<string, unknown>,
  path: string,
  next: unknown,
): Record<string, unknown> {
  const segments = path.split('.');
  const result = structuredClone(value);
  let cursor: unknown = result;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (cursor == null || typeof cursor !== 'object') {
      return result;
    }

    const container = cursor as Record<string, unknown> | unknown[];
    const nextSegment = segments[index + 1];
    const isArrayIndex = /^\d+$/.test(nextSegment);
    let existing = Array.isArray(container)
      ? container[Number(segment)]
      : (container as Record<string, unknown>)[segment];

    if (existing == null || typeof existing !== 'object') {
      existing = isArrayIndex ? [] : {};
      if (Array.isArray(container)) {
        container[Number(segment)] = existing;
      } else {
        (container as Record<string, unknown>)[segment] = existing;
      }
    }

    cursor = existing;
  }

  const lastSegment = segments.at(-1)!;
  if (cursor != null && typeof cursor === 'object') {
    if (Array.isArray(cursor)) {
      cursor[Number(lastSegment)] = next;
    } else {
      (cursor as Record<string, unknown>)[lastSegment] = next;
    }
  }

  return result;
}
