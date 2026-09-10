/**
 * Prefix a root-relative path with Astro's configured base.
 * Required when the site is served under a path prefix (e.g. GitHub Pages project sites).
 */
export function withBase(path: string): string {
  if (
    !path ||
    /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${baseWithSlash}${normalized}`;
}

export function buildAbsoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const site = `${(import.meta.env.SITE || '').replace(/\/$/, '')}/`;
  const base = import.meta.env.BASE_URL || '/';
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const normalized = path.replace(/^\//, '');
  return new URL(normalized, new URL(baseWithSlash, site)).href;
}
