# Counselling Website Template

A private-practice counselling website template built with Astro, React, and Tailwind CSS. It includes pages for Home, About, Specialties, Fees & Insurance, FAQ, Book a Consultation, Blog, Contact, and Privacy.

The template is designed so most ongoing updates happen in a few clear files instead of inside large page components.

## Quick start

```sh
npm install
npm run dev
```

Open the local URL shown in your terminal. For a production check, run:

```sh
npm run build
npm run preview
```

## Where to edit common content

| What you want to change | File or folder | Browser admin |
| --- | --- | --- |
| Practice name, contact, photos, nav labels, fees, booking copy | `src/content-data/practice.json` | `/admin/settings` |
| Page marketing copy (home, about, contact shell text, etc.) | `src/content-data/pages/*.json` | Inline edit mode on each page |
| FAQ questions and answers | `src/content-data/faq.json` | `/admin/faq` |
| Specialty pages | `src/content/specialties/` | Inline edit mode on specialty pages |
| Blog posts | `src/content/blog/` | Inline edit mode on blog posts |
| Photos and static files | `public/images/` | Image fields in edit mode |
| Page visibility, form backends, captcha, calendar URLs | `src/config/site.structural.ts` | Developer only |

## Browser admin (GitHub Pages CMS)

The site includes a static admin interface at `/admin` that commits changes directly to GitHub using your personal access token. No backend or database is required.

1. Copy `.env.example` to `.env` and set `PUBLIC_GITHUB_OWNER`, `PUBLIC_GITHUB_REPO`, and `PUBLIC_GITHUB_BRANCH`.
2. Create a fine-grained GitHub PAT scoped to this repository with **Contents: Read and write**.
3. Visit `/admin`, sign in with your token, and use:
   - **Site Settings** for shared practice details, fees, nav labels, and form copy
   - **FAQ** for question/answer management
   - **Edit mode** on public pages for page-local copy and image replacements

Changes are saved as Git commits to `main`, which triggers the existing GitHub Pages deploy workflow.

**Security:** the token is stored only in your browser (`localStorage`). Never commit tokens to the repository.

Validate content files locally:

```sh
npm run validate:content
```

### Local development saves

When running `npm run dev`, use **Start local editing** on `/admin` instead of a GitHub token. Saves go directly to files in your working tree via a dev-only API (`/__admin/content/*`) — no GitHub commits are created.

Edit mode and your session persist across page navigation via `localStorage`. Restart the dev server after pulling these changes so the local save middleware is active.

## Customize the practice details

Shared practice copy lives in `src/content-data/practice.json` and is editable via `/admin/settings`. Structural settings (page toggles, form backends, captcha, calendar URLs) remain in `src/config/site.structural.ts`.

```json
{
  "practiceName": "Counselling by Blank",
  "logo": "",
  "practitionerName": "Your Name",
  "credentials": "Registered Clinical Counsellor",
  "location": "Your City, Province",
  "phone": "(555) 123-4567",
  "email": "hello@example.com"
}
```

Set `logo` to a path like `/images/my-logo.png` to replace the header brand text with your logo image. Leave it blank to show `practiceName`.

## Turn pages on or off

Open `src/config/site.structural.ts` and edit the `pages` section.

Each page has:

- `enabled` - controls whether the page displays in the site.
- `href` - the page URL.
- `label` - the navigation/footer label.
- `showInNavigation` - controls whether the page appears in the main header navigation.

Example:

```ts
blog: {
  enabled: false,
  href: '/blog',
  label: 'Blog',
  showInNavigation: true,
},
```

When a page is disabled, it is removed from navigation and footer links. Optional dynamic pages, such as blog posts and specialty detail pages, stop generating. Main route files show a simple disabled message if someone visits them directly.

## Change theme colours

The site ships with four built-in palettes:

- `warm-earth` - coral, sage, and cream
- `ocean-calm` - soft blues and sand neutrals
- `forest-rest` - greens and warm cream
- `lavender-dusk` - muted purples and soft grey

To switch palettes, open `src/config/theme.ts` and change one line:

```ts
export const ACTIVE_PALETTE: PaletteName = 'warm-earth';
```

For example:

```ts
export const ACTIVE_PALETTE: PaletteName = 'ocean-calm';
```

Then restart the dev server or rebuild the site.

### Create a custom palette

Open `src/config/palettes.ts`, copy one palette object, give it a new name, and adjust the HSL values.

Colour values use this format:

```txt
Hue Saturation% Lightness%
```

For example:

```ts
primary: '196 42% 55%',
```

Useful tokens:

- `background` controls the main page background.
- `foreground` controls default body text.
- `primary` controls main buttons, links, and highlights.
- `secondary` controls softer panels and supporting sections.
- `accent` controls warm visual accents.
- `muted` and `muted-foreground` control quieter text and backgrounds.

After adding a palette, update the `PaletteName` type and choose it in `src/config/theme.ts`.

### Browser tab colour

Each palette has a `metaThemeColor` value. Update that hex colour in `src/config/palettes.ts` if you want the browser tab colour to match a custom palette.

### When editing components

Prefer theme classes like `bg-primary`, `text-primary`, `bg-background`, `text-muted-foreground`, and `border-border`. Avoid hardcoded colour classes like `bg-blue-100` so palette changes keep working.

## Change photos

Photos live in `public/images/`.

To replace a photo:

1. Add your new image to `public/images/`.
2. Update the matching path in `src/content-data/practice.json` or in a markdown page frontmatter.
3. Keep paths starting with `/images/`, for example `/images/my-office.jpg`.

Specialty and blog images are controlled in each markdown file:

```yaml
heroImage: /images/nature-temp.jpg
```

## Add or edit specialties

Specialty pages live in `src/content/specialties/`.

To add a specialty:

1. Copy an existing file, such as `anxiety.md`.
2. Rename it, for example `grief.md`.
3. Update the frontmatter at the top.
4. Replace the body copy.

Example:

```yaml
---
title: Grief
description: Support for loss, change, and making room for what matters.
order: 4
heroImage: /images/flowers-temp.jpg
---
```

The `order` field controls the order on the Specialties page.

## Add or edit blog posts

Blog posts live in `src/content/blog/`.

To add a post:

1. Copy an existing post.
2. Rename the file using lowercase words and hyphens.
3. Update the title, description, date, image, and body.

Example:

```yaml
---
title: A New Blog Post
description: A short summary for search engines and the blog listing.
pubDate: 2026-06-15
heroImage: /images/mountains-temp.png
draft: false
---
```

Set `draft: true` to keep a post out of the public blog.

## Edit fees and FAQ

Fees and insurance notes are in `src/content-data/practice.json`. Service rows come from `forms.bookSession.sessionTypes` (label, `durationMinutes`, fee, and `description`). Insurance notes live under `fees.insuranceNotes`.

FAQ content is in `src/content-data/faq.json`. Each item has an `id`, `question`, and `answer`.

## Connect forms

The Contact and Book a Consultation forms are controlled in `src/config/site.structural.ts` (backends and providers) and `src/content-data/practice.json` (form copy and labels).

By default, forms use:

```ts
backend: 'demo',
```

Demo mode shows an on-page success message but does not send email.

## Add session booking and public calendar availability

The `/book` page can show two booking modes:

- `Book a Consultation` - a starter consultation request form.
- `Book a Session` - a session request form with optional live availability from a public Google Calendar.

Session booking is controlled in `src/config/site.structural.ts` (backend, calendar URLs) and `src/content-data/practice.json` (labels, session types, booking copy):

### Built-in forms (default)

```ts
bookSession: {
  backend: 'built-in',
```

### External booking link (Jane App, Owl, etc.)

If you already use an online booking portal, set `backend: 'external-link'` and add your portal URL and button label. The `/book` page becomes a short landing page with a link out, and site CTAs (header, home, footer) point directly to that URL.

```ts
bookSession: {
  backend: 'external-link',
  externalLink: {
    url: 'https://your-practice.janeapp.com/',
    label: 'Book on Jane App',
    description:
      'You will leave this site to view availability and complete your profile.',
  },
```

Calendar sync and the built-in availability picker are skipped when `external-link` is selected.

### Built-in booking settings

```ts
bookSession: {
  backend: 'built-in',
  enabled: true,
  label: 'Book a Session',
  description: 'Send a session request...',
  descriptionWithCalendar: 'Choose a session type and an available time...',
  calendar: {
    enabled: true,
    provider: 'google',
    mode: 'public-link',
    publicCalendarUrl: 'https://calendar.google.com/calendar/...',
    icsFeedUrl: 'https://calendar.google.com/calendar/ical/.../public/basic.ics',
    embedUrl: 'https://calendar.google.com/calendar/embed?...',
    timeZone: 'America/Vancouver',
    businessHours: {
      days: [1, 2, 3, 4], // Monday through Thursday
      start: '09:00',
      end: '17:00',
    },
    slotIntervalMinutes: 30,
    lookaheadDays: 28,
    availabilityHelpText: 'Available times are based on the public calendar...',
    availabilitySync: {
      enabled: true,
      jsonPath: '/calendar-availability.json',
    },
    availabilityPicker: {
      enabled: true,
      weekStartsOn: 1,
    },
  },
  sessionTypes: [
    {
      label: 'Brief consultation',
      durationMinutes: 15,
      fee: 'Free',
      description: 'A brief call to ask questions and decide on next steps.',
      modes: ['virtual', 'in_person'],
      kind: 'consultation',
    },
    {
      label: 'Individual counselling',
      durationMinutes: 50,
      fee: '$150',
      description: 'One-to-one support for anxiety, mood, stress, and life transitions.',
      modes: ['virtual', 'in_person'],
      kind: 'session',
    },
  ],
},
```

Each `sessionTypes` entry includes a `kind` of `'consultation'` or `'session'`. Consultation types power the consultation tab (including calendar availability when enabled). Session types power the session tab.

Each entry can list one or more delivery modes in `modes`: `'virtual'`, `'in_person'`, or both. The booking form's location/mode dropdown is built from the selected type's `modes`.

Set `bookSession.enabled: false` to hide the session booking tab and keep only the consultation form.

Set `bookSession.calendar.enabled: false`, or remove the public calendar link, to hide all calendar UI and fall back to a free-text preferred date/time field.

### Session duration and scheduling buffer

Each `sessionTypes` entry uses `durationMinutes`. Available times are shown to clients using that session length (for example, 9:00 AM – 9:50 AM for a 50-minute session).

Internally, the site requires an extra 10-minute buffer when checking the calendar so sessions are not booked back-to-back. That buffer is not shown in the slot labels.

### Sync availability with GitHub Actions (recommended)

Google's ICS feed blocks direct browser requests (CORS). The recommended setup syncs busy intervals to a same-origin JSON file that the booking page reads in the browser.

In `src/config/site.structural.ts`:

```ts
icsFeedUrl:
  'https://calendar.google.com/calendar/ical/.../public/basic.ics',
availabilitySync: {
  enabled: true,
  jsonPath: '/calendar-availability.json',
},
```

- `icsFeedUrl` is used by the sync script and GitHub Action (public URL, safe to keep in `site.structural.ts`).
- `availabilitySync.enabled: false` skips sync and falls back to direct ICS loading in the browser (may fail due to CORS).
- `jsonPath` must match a file under `public/` (for example `public/calendar-availability.json`).

Sync locally:

```bash
npm run sync:calendar
```

GitHub Action (`.github/workflows/sync-calendar-availability.yml`):

- runs every 15 minutes on a schedule
- supports manual **Run workflow** via `workflow_dispatch`
- reads `icsFeedUrl` from `site.structural.ts`, writes `public/calendar-availability.json`, and commits when changed
- your host rebuilds on push

The workflow checks `src/config/site.structural.ts` before installing dependencies. It skips when `calendar.enabled` or `availabilitySync.enabled` is `false`.

To disable calendar sync entirely, set `availabilitySync.enabled: false` or `calendar.enabled: false`. The site still works without it.

### Use the custom availability picker

When `availabilitySync.enabled` and `availabilityPicker.enabled` are both `true`, the session form replaces the dropdown with a custom week-view calendar. Visitors can see openings in the configured business hours and click a preferred slot directly.

The picker:

- reads same-origin availability from `availabilitySync.jsonPath`
- uses `businessHours`, `slotIntervalMinutes`, and `lookaheadDays` from `site.structural.ts`
- recalculates openings when a visitor changes between 50-minute and 75-minute sessions
- shows session length in the calendar while keeping the 10-minute buffer internal
- submits `preferredDateTime`, `preferredDateTimeIso`, and `sessionDurationMinutes` with the form

Set `availabilityPicker.enabled: false` to keep the synced JSON flow but fall back to the simpler dropdown.

### Add a public Google Calendar link

Create a public Google Calendar that only shows free/busy availability, then paste its shared URL into:

```ts
publicCalendarUrl: 'https://calendar.google.com/calendar/...',
```

Set the ICS feed URL directly, or let the site derive it from your public calendar link:

```ts
icsFeedUrl:
  'https://calendar.google.com/calendar/ical/.../public/basic.ics',
```

If `icsFeedUrl` is blank, the site builds this URL automatically from `publicCalendarUrl` or `embedUrl`.

### Add a Google Calendar embed fallback

The custom picker is the recommended calendar UI when synced JSON is enabled. If you disable `availabilityPicker.enabled`, you can still show the Google Calendar embed above the dropdown by pasting the embed URL into:

```ts
embedUrl: 'https://calendar.google.com/calendar/embed?...',
```

You can paste either the embed URL alone or the full `<iframe ...>` snippet from Google Calendar — the site extracts the URL automatically.

If `embedUrl` is blank, the page still uses the public calendar for slot picking and shows an external calendar link when `publicCalendarUrl` is set.

### One form endpoint for all form types

Each backend uses one shared form endpoint. Contact, consultation, and session submissions are separated by hidden fields in the form body:

- `formKind` - `contact`, `booking`, or `session`
- `formLabel` - human-readable form name
- `_subject` - email subject for services that use it
- `provider` - selected backend provider

Use those fields in your form backend dashboard, email templates, automations, or serverless endpoint to route submissions.

### Choose a form backend

Supported values:

- `disabled` - hides the Contact and Book forms and shows email/phone instructions instead.
- `demo` - no backend; useful while editing the template.
- `formspree` - posts directly to Formspree form endpoints.
- `formbold` - posts directly to Formbold form endpoints.
- `usebasin` - posts directly to Basin form endpoints.
- `resend` - posts to your own secure backend route that sends email through Resend.
- `custom` - posts to any custom endpoint you provide.

Example:

```ts
forms: {
  backend: 'formspree',
  // ...
}
```

To turn forms off entirely:

```ts
forms: {
  backend: 'disabled',
  // ...
}
```

When forms are disabled, the Contact and Book pages still display practice contact information and ask visitors to email the address in `src/content-data/practice.json`.

Then update the matching provider config:

```ts
formspree: {
  action: 'https://formspree.io/f/YOUR_FORM_ID',
},
```

For Formbold:

```ts
formbold: {
  action: 'https://formbold.com/s/YOUR_FORM_ID',
},
```

For Basin:

```ts
usebasin: {
  action: 'https://usebasin.com/f/YOUR_FORM_ID',
},
```

Basin works as a no-code HTML form backend. Create form endpoints in Basin, copy each endpoint URL, and paste it into the matching action. Basin's docs show the direct form action pattern as `https://usebasin.com/f/YOUR-FORM-ID` with `method="POST"`; see the [Basin documentation](https://docs.usebasin.com/) and [HTML Form Backend guide](https://docs.usebasin.com/creating-forms/form-backend/).

For a custom endpoint:

```ts
custom: {
  action: 'https://your-endpoint.example/forms',
},
```

### Resend note

Resend requires a secure backend or serverless function because API keys must never be exposed in browser code. The template includes Resend endpoint settings:

```ts
resend: {
  action: '/api/forms',
  fromEmail: 'website@example.com',
  toEmail: 'hello@example.com',
},
```

Create those backend routes in your hosting platform and use the Resend API key there.

### Secure Google Calendar event creation

The public Google Calendar setup is static-friendly: it shows availability and collects a session request, but it does not create a confirmed calendar event.

To create an event as the calendar owner, add the client as an attendee, and send Google Calendar invitations, you need a secure serverless endpoint. Browser-only code must not contain Google credentials.

A secure endpoint would:

1. Receive validated session form data.
2. Check calendar availability with Google Calendar FreeBusy.
3. Create an event with Google Calendar Events insert.
4. Add the client email as an attendee and send updates.
5. Store credentials in environment variables.

Suggested environment variables:

```txt
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_CALENDAR_TIME_ZONE=America/Vancouver
```

Useful Google docs:

- [FreeBusy query](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- [Events insert](https://developers.google.com/calendar/api/v3/reference/events/insert)
- [Create events](https://developers.google.com/calendar/api/guides/create-events)
- [Invite users to an event](https://developers.google.com/calendar/api/concepts/inviting-attendees-to-events)

### Captcha

Captcha is also configured in `src/config/site.structural.ts`.

```ts
captcha: {
  enabled: true,
  provider: 'hcaptcha',
  siteKey: 'YOUR_SITE_KEY',
},
```

Supported providers:

- `hcaptcha`
- `google-recaptcha`

The template renders the correct captcha widget and loads the provider script when captcha is enabled. Your form backend should verify captcha responses server-side before trusting submissions.

Before using forms with clients, make sure your provider is appropriate for the kind of information you collect and the privacy requirements in your region.

## Update the site URL

For local development, the default `site` in `astro.config.mjs` is `https://example.com`. GitHub Pages deployments set `ASTRO_SITE_URL` and `ASTRO_BASE_PATH` automatically during the build.

For other hosts, set the production domain before launch (or pass `ASTRO_SITE_URL` in your build environment). This controls canonical URLs for search engines.

## Deploy

This is a static Astro site and can be deployed to hosts such as Netlify, Vercel, Cloudflare Pages, or any static hosting provider.

Typical build command:

```sh
npm run build
```

Typical output directory:

```txt
dist
```

### Deploy to GitHub Pages

1. In your repo, go to **Settings → Pages → Build and deployment** and choose **GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/deploy-pages.yml` builds with the correct base path and deploys `dist`.
3. Project sites are served at `https://<user>.github.io/<repo-name>/` (for example `https://brysonbest.github.io/counselling-website-template/`).

To verify a prefixed build locally before pushing:

```sh
ASTRO_BASE_PATH=/counselling-website-template ASTRO_SITE_URL=https://<user>.github.io npm run build
npm run preview
```

Open the preview URL and confirm CSS, JS, and images load from paths under `/counselling-website-template/`.

If you add a custom domain in GitHub Pages settings, the deploy workflow receives an empty base path and the site builds for root hosting (`base: '/'`).

## License

[MIT](LICENSE) for code and documentation. Included images are sourced from Pixabay and are not covered by the MIT license; see the image note in `LICENSE` and the [Pixabay license summary](https://pixabay.com/service/license-summary/).