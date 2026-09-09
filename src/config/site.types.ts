import type { SessionTypeConfig } from '../lib/session';

export type SessionType = SessionTypeConfig;

export type SessionBusinessHours = {
  /** 0 = Sunday through 6 = Saturday */
  days: number[];
  start: string;
  end: string;
};

export type PageKey =
  | 'home'
  | 'about'
  | 'specialties'
  | 'fees'
  | 'faq'
  | 'book'
  | 'blog'
  | 'contact'
  | 'privacy';

export type FormBackend =
  | 'disabled'
  | 'demo'
  | 'formspree'
  | 'formbold'
  | 'usebasin'
  | 'resend'
  | 'custom';

export type BookingBackend = 'built-in' | 'external-link';

export type CaptchaProvider = 'google-recaptcha' | 'hcaptcha';

export type FormKind = 'contact' | 'booking' | 'session';

export type SessionCalendarMode = 'public-link' | 'serverless-google-api';

export type PageConfig = {
  enabled: boolean;
  href: string;
  label: string;
  showInNavigation: boolean;
  consultationLabel?: string;
};
