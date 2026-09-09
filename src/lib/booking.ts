import { siteConfig } from '../config';
import { withBase } from './paths';

export function isBuiltInBookingEnabled() {
  return siteConfig.forms.bookSession.backend === 'built-in';
}

export function isExternalBookingEnabled() {
  const { backend, externalLink } = siteConfig.forms.bookSession;

  return backend === 'external-link' && Boolean(externalLink.url.trim());
}

/** Primary booking destination for CTAs and footer links. */
export function getBookHref() {
  if (isExternalBookingEnabled()) {
    return siteConfig.forms.bookSession.externalLink.url.trim();
  }

  return withBase(siteConfig.pages.book.href);
}

export function getBookLinkProps(): {
  href: string;
  target?: '_blank';
  rel?: 'noreferrer';
} {
  const href = getBookHref();

  if (isExternalBookingEnabled()) {
    return { href, target: '_blank', rel: 'noreferrer' };
  }

  return { href };
}
