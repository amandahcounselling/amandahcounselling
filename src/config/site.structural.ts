import type {
  BookingBackend,
  CaptchaProvider,
  FormBackend,
  PageKey,
  SessionCalendarMode,
} from './site.types';

/**
 * Structural site settings — developer-only.
 * User-facing copy lives in src/content-data/practice.json and is edited via /admin.
 */
export const structuralSiteConfig = {
  pages: {
    home: { enabled: true, href: '/', showInNavigation: true },
    about: {
      enabled: true,
      href: '/about',
      showInNavigation: true,
    },
    specialties: {
      enabled: true,
      href: '/specialties',
      showInNavigation: true,
    },
    fees: {
      enabled: true,
      href: '/fees',
      showInNavigation: true,
    },
    faq: { enabled: true, href: '/faq', showInNavigation: true },
    book: {
      enabled: true,
      href: '/book',
      showInNavigation: false,
    },
    blog: {
      enabled: true,
      href: '/blog',
      showInNavigation: true,
    },
    contact: {
      enabled: true,
      href: '/contact',
      showInNavigation: true,
    },
    privacy: {
      enabled: true,
      href: '/privacy',
      showInNavigation: false,
    },
  } satisfies Record<
    PageKey,
    {
      enabled: boolean;
      href: string;
      showInNavigation: boolean;
      consultationLabel?: string;
    }
  >,

  forms: {
    backend: 'demo' as FormBackend,

    bookSession: {
      backend: 'built-in' as BookingBackend,

      externalLink: {
        url: 'https://jane.app/',
      },

      calendar: {
        enabled: false,
        provider: 'google',
        mode: 'public-link' as SessionCalendarMode,
        publicCalendarUrl: '',
        icsFeedUrl: '',
        embedUrl: '',
        timeZone: 'America/Vancouver',
        businessHours: {
          days: [1, 2, 3, 4, 5, 6, 7],
          start: '09:00',
          end: '17:00',
        },
        slotIntervalMinutes: 30,
        lookaheadDays: 28,
        availabilitySync: {
          enabled: true,
          jsonPath: '/calendar-availability.json',
        },
        availabilityPicker: {
          enabled: true,
          weekStartsOn: 1,
        },
      },
    },

    captcha: {
      enabled: false,
      provider: 'hcaptcha' as CaptchaProvider,
      siteKey: '',
    },

    providers: {
      disabled: { action: '' },
      demo: { action: '' },
      formspree: { action: 'https://formspree.io/f/YOUR_FORM_ID' },
      formbold: { action: 'https://formbold.com/s/YOUR_FORM_ID' },
      usebasin: { action: 'https://usebasin.com/f/YOUR_FORM_ID' },
      resend: {
        action: '/api/forms',
        fromEmail: 'website@example.com',
        toEmail: 'hello@example.com',
      },
      custom: { action: '' },
    },
  },
};

export type StructuralSiteConfig = typeof structuralSiteConfig;
