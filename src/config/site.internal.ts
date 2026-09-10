import {
  resolveGoogleCalendarEmbedUrl,
  resolveGoogleCalendarId,
  resolveGoogleCalendarIcsFeedUrl,
} from '../lib/calendar';
import { withBase } from '../lib/paths';
import type { BookingKind } from '../lib/session';
import { siteConfig } from './site';
import type { PageKey } from './site.types';

export const enabledPages = Object.entries(siteConfig.pages)
  .filter(([, page]) => page.enabled)
  .map(([key, page]) => ({
    key: key as PageKey,
    ...page,
    href: withBase(page.href),
  }));

export const navigationLinks = enabledPages.filter(
  (page) => page.showInNavigation,
);

/** Public CTA label for header, footer, home, and other site links. */
export function getBookCtaLabel() {
  if (siteConfig.forms.bookSession.enabled) {
    return siteConfig.forms.bookSession.siteCtaLabel;
  }

  return siteConfig.pages.book.label;
}

/** Consultation tab label on the /book page only. */
export function getBookConsultationToggleLabel() {
  return siteConfig.pages.book.consultationLabel;
}

export function getSessionCalendarId() {
  const { calendar } = siteConfig.forms.bookSession;
  return resolveGoogleCalendarId(calendar.publicCalendarUrl, calendar.embedUrl);
}

export function getSessionCalendarIcsFeedUrl() {
  const { calendar } = siteConfig.forms.bookSession;
  return resolveGoogleCalendarIcsFeedUrl(
    calendar.publicCalendarUrl,
    calendar.embedUrl,
    calendar.icsFeedUrl,
  );
}

/** True when availability JSON sync is enabled in site config. */
export function isSessionAvailabilitySyncEnabled() {
  const { calendar } = siteConfig.forms.bookSession;

  if (!calendar.enabled) {
    return false;
  }

  return Boolean(calendar.availabilitySync?.enabled && calendar.availabilitySync.jsonPath);
}

/** True when the custom synced-availability calendar picker should replace the dropdown. */
export function isSessionAvailabilityPickerEnabled() {
  const { calendar } = siteConfig.forms.bookSession;
  return Boolean(
    isSessionAvailabilitySyncEnabled() && calendar.availabilityPicker?.enabled,
  );
}

/** True when the calendar sync script and GitHub Action should run. */
export function shouldRunCalendarAvailabilitySync() {
  if (siteConfig.forms.bookSession.backend !== 'built-in') {
    return false;
  }

  if (!isSessionAvailabilitySyncEnabled()) {
    return false;
  }

  return Boolean(getSessionCalendarIcsFeedUrl());
}

export function getSessionTypesByKind(kind: BookingKind) {
  return siteConfig.forms.bookSession.sessionTypes.filter(
    (session) => session.kind === kind,
  );
}

function getSessionAvailabilityJsonPathRaw() {
  const { availabilitySync } = siteConfig.forms.bookSession.calendar;
  if (!availabilitySync?.enabled) {
    return '';
  }

  return availabilitySync.jsonPath.trim();
}

/** Public URL path for the availability JSON (includes Astro base when set). */
export function getSessionAvailabilityJsonPath() {
  const jsonPath = getSessionAvailabilityJsonPathRaw();
  return jsonPath ? withBase(jsonPath) : '';
}

/** Filesystem path used by the calendar sync script. */
export function getSessionAvailabilityPublicFilePath() {
  const jsonPath = getSessionAvailabilityJsonPathRaw();
  if (!jsonPath) {
    return '';
  }

  return jsonPath.startsWith('/') ? `public${jsonPath}` : `public/${jsonPath}`;
}

/** True when session calendar integration should be shown and used for slot picking. */
export function isSessionCalendarActive() {
  if (siteConfig.forms.bookSession.backend !== 'built-in') {
    return false;
  }

  const { calendar } = siteConfig.forms.bookSession;

  if (!calendar.enabled) {
    return false;
  }

  if (isSessionAvailabilitySyncEnabled()) {
    return Boolean(getSessionAvailabilityJsonPath() && getSessionCalendarIcsFeedUrl());
  }

  return Boolean(getSessionCalendarIcsFeedUrl());
}

export function getSessionBookingDescription() {
  const { bookSession } = siteConfig.forms;
  return isSessionCalendarActive()
    ? bookSession.descriptionWithCalendar
    : bookSession.description;
}

export function getSessionCalendarEmbedUrl() {
  return resolveGoogleCalendarEmbedUrl(
    siteConfig.forms.bookSession.calendar.embedUrl,
  );
}

/** False when practice.json sets `phone` to `"disabled"` — hide phone UI site-wide. */
export function isPhoneEnabled() {
  return siteConfig.phone.trim().toLowerCase() !== 'disabled';
}

export type SiteConfig = typeof siteConfig;
