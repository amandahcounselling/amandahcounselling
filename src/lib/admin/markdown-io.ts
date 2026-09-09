/**
 * Browser-safe markdown frontmatter helpers (no Node-only dependencies).
 * Supports the flat key/value frontmatter used by blog and specialty collections.
 */

export type ParsedMarkdown = {
  frontmatter: Record<string, unknown>;
  body: string;
};

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export function parseMarkdown(content: string): ParsedMarkdown {
  const match = content.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { frontmatter: {}, body: content.trim() };
  }

  return {
    frontmatter: parseSimpleYaml(match[1]),
    body: match[2].trimStart(),
  };
}

export function serializeMarkdown(frontmatter: Record<string, unknown>, body: string) {
  const yaml = serializeSimpleYaml(frontmatter);
  return `---\n${yaml}---\n\n${body.trim()}\n`;
}

function parseSimpleYaml(source: string) {
  const result: Record<string, unknown> = {};

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    result[key] = parseYamlValue(rawValue);
  }

  return result;
}

function parseYamlValue(rawValue: string): unknown {
  if (!rawValue) return '';

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;

  if (/^-?\d+$/.test(rawValue)) {
    return Number.parseInt(rawValue, 10);
  }

  return rawValue;
}

function serializeSimpleYaml(frontmatter: Record<string, unknown>) {
  return Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: ${needsQuotes(value) ? JSON.stringify(value) : value}`;
      }
      if (typeof value === 'boolean' || typeof value === 'number') {
        return `${key}: ${String(value)}`;
      }
      return `${key}: ${JSON.stringify(String(value ?? ''))}`;
    })
    .join('\n')
    .concat('\n');
}

function needsQuotes(value: string) {
  return /[:#{}[\],&*!?|>'"%@`]/.test(value) || value.startsWith(' ') || value.endsWith(' ');
}

export function formatPubDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return String(value ?? '');
}
