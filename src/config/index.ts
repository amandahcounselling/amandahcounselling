/**
 * Public config API for the site. Import from here in components and scripts.
 * To customize your practice, edit site.ts only.
 */
export { siteConfig } from './site';

export type {
  BookingBackend,
  CaptchaProvider,
  FormBackend,
  FormKind,
  PageKey,
  SessionBusinessHours,
  SessionCalendarMode,
  SessionType,
} from './site.types';

export type { SiteConfig } from './site.internal';

export {
  enabledPages,
  getBookConsultationToggleLabel,
  getBookCtaLabel,
  getSessionAvailabilityJsonPath,
  getSessionAvailabilityPublicFilePath,
  getSessionBookingDescription,
  getSessionCalendarEmbedUrl,
  getSessionCalendarIcsFeedUrl,
  getSessionCalendarId,
  getSessionTypesByKind,
  isPhoneEnabled,
  isSessionAvailabilityPickerEnabled,
  isSessionAvailabilitySyncEnabled,
  isSessionCalendarActive,
  navigationLinks,
  shouldRunCalendarAvailabilitySync,
} from './site.internal';
