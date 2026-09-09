# Setup guide for your counselling website

This guide is written for counsellors and practice owners — not web developers. It walks you through what to set up outside the website, what to change in the main settings files, and where to replace template wording so the site feels fully yours.

For technical details (commands, deployment, calendar sync, form backends), see [README.md](README.md).

---

## Before you start

You will need:

- A copy of this website project on your computer (or in a GitHub account your developer or host can access)
- A way to edit text files (VS Code, Cursor, or any plain-text editor)
- Your practice details ready: name, credentials, fees, photos, policies, and how you want people to book

**Helpful order of work:**

1. Create any external accounts you need (forms, booking, hosting)
2. Update `src/config/site.ts` and `src/config/theme.ts`
3. Replace content in the page and data files
4. Add your photos
5. Preview the site locally, then publish

---

## Part 1: Accounts you may need to create

You do not need every account below. Choose what matches how you want the site to work.

### Website hosting (required to go live)

Pick a host that can publish a static website. Common choices:

| Service | What it does |
| --- | --- |
| [Netlify](https://www.netlify.com/) | Hosts the site; can connect to GitHub for automatic updates |
| [Vercel](https://vercel.com/) | Similar to Netlify |
| [Cloudflare Pages](https://pages.cloudflare.com/) | Similar; works well if your domain is already on Cloudflare |

You will connect your domain name (e.g. `www.yourpractice.ca`) in the host’s settings after the site is built.

### Domain name (recommended)

Register your practice domain with a registrar (e.g. Namecheap, Google Domains, Cloudflare, Hover). Point it to your hosting provider using their instructions.

### Contact and booking forms (if using built-in forms)

The site can send contact and booking requests by email through a form service. Create a free or paid account with one of these:

| Service | Good for |
| --- | --- |
| [Formspree](https://formspree.io/) | Simple setup; paste a form URL into the site |
| [FormBold](https://formbold.com/) | Similar to Formspree |
| [UseBasin](https://usebasin.com/) | Similar; no-code form backend |

After you create a form, the service gives you a **form action URL**. You paste that into `site.ts` (see Part 2).

Until you connect a real form service, the site runs in **demo mode**: it shows a success message but does not email you.

### External online booking (Jane App, Owl, etc.)

If you already book clients through **Jane App**, **Owl Practice**, **SimplePractice**, or similar, you do not need the built-in calendar or session forms. You only need:

- Your booking portal URL (from your Jane/Owl profile)
- A short label for the button (e.g. “Book on Jane App”)

You will turn on **external booking** in `site.ts` instead of setting up form URLs for sessions.

### Google Calendar (only if using built-in booking with live availability)

If you want clients to pick times from *your* calendar on the website:

1. Use a **Google account** with a calendar for appointments
2. Make that calendar **public** (or share a public link / ICS feed — see README for details)
3. Copy the calendar URLs into `site.ts`

If you use Jane/Owl for scheduling, skip Google Calendar setup and use external booking instead.

### GitHub (only if using built-in calendar sync)

The recommended calendar setup syncs your Google Calendar to the website automatically. That uses a free **GitHub** account and a repository for this project. Your developer or technically inclined colleague can enable the included workflow, or you can follow the calendar section in the README.

### Spam protection / captcha (optional)

If you get unwanted form submissions, you can add [hCaptcha](https://www.hcaptcha.com/) or [Google reCAPTCHA](https://www.google.com/recaptcha/). You will get a **site key** to paste into `site.ts`.

---

## Part 2: Settings in `site.ts`

**File location:** `src/config/site.ts` — this is the only settings file you need to edit. Types and helper logic live in `site.types.ts` and `site.internal.ts`; leave those alone unless you are developing the template itself.

Think of this as your practice control panel. Most site-wide behaviour is set here.

### Practice identity (update first)

Replace every placeholder with your real information:

| Setting | What visitors see |
| --- | --- |
| `practiceName` | Site header, footer, page titles |
| `practitionerName` | About page heading |
| `credentials` | About page (e.g. “Registered Clinical Counsellor”) |
| `tagline` | Large headline on the home page |
| `description` | Search engine summary; default page description |
| `location` | Footer and contact areas |
| `phone` | Footer and contact |
| `email` | Footer, contact, privacy page |
| `hours` | When you are generally available |
| `responseTime` | e.g. “1–2 business days” on the booking page |
| `heroImage` | Main photo on the home page |
| `aboutImage` | Photo on the About page |
| `defaultImage` | Fallback image where needed |
| `socialLinks` | Instagram / LinkedIn URLs (leave blank if unused) |

Image paths always start with `/images/`, e.g. `/images/my-headshot.jpg`. Put the actual image files in `public/images/`.

### Which pages are visible

Under `pages`, each section has:

- **`enabled`** — `true` to show the page, `false` to hide it
- **`label`** — the name in menus and footer
- **`showInNavigation`** — whether it appears in the top menu

Example: to hide the blog until you are ready to write posts:

```ts
blog: {
  enabled: false,
  ...
},
```

The **Book** page uses `consultationLabel` for the consultation tab wording on the booking page.

### Contact forms

Under `forms`:

```ts
backend: 'formspree',  // change from 'demo' when ready
```

Then paste your form URL in the matching provider block, e.g.:

```ts
formspree: {
  action: 'https://formspree.io/f/your-form-id',
},
```

Set `backend: 'disabled'` if you do not want forms to submit at all (visitors will see a message to email you instead).

### Booking: choose one path

#### Option A — External booking (Jane App, Owl, etc.)

```ts
bookSession: {
  backend: 'external-link',
  externalLink: {
    url: 'https://your-practice.janeapp.com/',
    label: 'Book an appointment online',
    description: 'Short note explaining they will leave your site to book.',
  },
  ...
}
```

Site buttons will open your booking portal in a new tab. You can ignore the calendar and `sessionTypes` settings for scheduling (they are not used in this mode).

#### Option B — Built-in booking forms

```ts
bookSession: {
  backend: 'built-in',
  enabled: true,           // show “Book a Session” tab
  siteCtaLabel: 'Book with me',  // main button text site-wide
  ...
}
```

Under **`sessionTypes`**, list each appointment type:

| Field | Meaning |
| --- | --- |
| `label` | Name shown in the dropdown |
| `durationMinutes` | Length of the appointment |
| `fee` | What you charge (text, e.g. `$155` or `Free`) |
| `description` | Short blurb on the Fees page |
| `modes` | `virtual`, `in_person`, or both |
| `kind` | `consultation` (consultation tab) or `session` (session tab) |

Match these fees to what you list on your Fees page.

**Calendar section** (built-in only): set `calendar.enabled: false` if you do not use live availability. If you do, add your Google Calendar URLs and set `timeZone` and `businessHours` to match when you actually take clients.

---

## Part 3: Colours in `theme.ts`

**File location:** `src/config/theme.ts`

The site includes four ready-made colour palettes. Change one line to switch the whole look:

```ts
export const ACTIVE_PALETTE: PaletteName = 'forest-rest';
```

Choices:

| Name | Feel |
| --- | --- |
| `warm-earth` | Coral, sage, cream |
| `ocean-calm` | Soft blues and sand |
| `forest-rest` | Greens and warm cream |
| `lavender-dusk` | Muted purples and grey |

After changing the palette, restart your local preview or rebuild before publishing.

To create your own colours, see `src/config/palettes.ts` and the README — or ask a designer/developer to adjust HSL values there.

---

## Part 4: Content to customize (remove all template wording)

Use this checklist so no placeholder language is left on the live site.

### Quick-reference: where things live

| What | File or folder |
| --- | --- |
| Practice name, contact, forms, booking | `src/config/site.ts` |
| Colours | `src/config/theme.ts` |
| Fees and insurance notes | `sessionTypes` and `fees` in `src/config/site.ts` |
| FAQ questions and answers | `src/data/faq.ts` |
| Specialty pages | `src/content/specialties/` |
| Blog posts | `src/content/blog/` |
| Photos | `public/images/` |
| Home page sections (approach, services) | `src/components/HomePage.tsx` |
| About page bio and values | `src/components/AboutPage.tsx` |
| Privacy policy sections | `src/components/PrivacyPage.tsx` |
| Specialties listing intro | `src/components/SpecialtiesPage.tsx` |
| Browser tab titles (search results) | `src/pages/*.astro` |

### Fees and insurance (`site.ts`)

The Fees page lists every entry in `forms.bookSession.sessionTypes`. For each service, set `label`, `durationMinutes`, `fee`, and `description`.

Insurance and payment notes are under `fees.insuranceNotes` at the top of `site.ts`.

### `src/data/faq.ts`

Rewrite each `question` and `answer` in your own voice. Pay special attention to:

- Session length and format (virtual / in-person)
- Your therapeutic approaches
- Insurance and receipts
- Cancellation policy

Remove any answer that still says “template” or “starter copy.”

### `src/components/HomePage.tsx`

Search for and replace template phrases, including:

- “Private practice counselling template” (top eyebrow text)
- “This template gives counsellors…” (intro paragraph)
- “Counselling copy that is ready to customize”
- The `approaches` list (person-centred, trauma-informed, etc.) — use your real modalities
- The `services` bullet list — describe who you work with and what you offer
- “Starter specialty pages” heading
- “Ready to make it your own?” closing section — rewrite for clients, not for someone editing the template

### `src/components/AboutPage.tsx`

Replace:

- Page `description` under `PageShell`
- Both bio paragraphs (currently say “starter copy”)
- The `values` array (collaborative care, etc.) — use your real principles
- “Therapeutic approach” section text and the three value cards

Add a meaningful `alt` text on your photo if you customize the image tag.

### `src/components/PrivacyPage.tsx`

This is a **placeholder policy**, not legal advice. Rewrite every section for your practice, tools, and province/country. Update “Last updated” to the current month and year. Consider having a lawyer or your professional college’s guidance review it before launch.

### `src/components/SpecialtiesPage.tsx`

Change the page description — it currently says the pages are “starter” examples.

### `src/pages/*.astro` (page titles)

Several files still use **“Counselling by Blank”** in the browser tab title. Search the `src/pages/` folder for that phrase (and for “Private Practice Counselling Template”) and replace with your `practiceName`.

Also update `src/pages/index.astro` — the home page title and description are important for Google.

### `public/images/`

Replace template photos (`woman-sitting-temp.jpg`, `nature-temp.jpg`, etc.) with your own headshots, office, or stock images you have rights to use. Update paths in `site.ts` and in specialty/blog frontmatter.

### `public/favicon.svg`

Swap for a simple logo or initial if you want a custom browser icon.

### `astro.config.mjs`

Before launch, set `site:` to your real domain (e.g. `https://www.yourpractice.ca`). See README.

---

## Part 5: How to write specialty pages

Specialty pages explain the kinds of concerns you help with (anxiety, grief, relationships, etc.).

**Folder:** `src/content/specialties/`

### Add a new specialty

1. Duplicate an existing file, e.g. copy `anxiety.md` to `grief.md`
2. The **file name** becomes the web address: `grief.md` → `/specialties/grief`
3. Edit the top section (between the `---` lines) and the article below

### Frontmatter (top of the file)

```yaml
---
title: Grief
description: One or two sentences for the card on your Specialties page and search engines.
order: 4
heroImage: /images/your-photo.jpg
---
```

| Field | Purpose |
| --- | --- |
| `title` | Page heading |
| `description` | Short summary shown on listings |
| `order` | Sort order on the Specialties page (lower numbers appear first) |
| `heroImage` | Banner image; path under `public/images/` |

### Body (below the frontmatter)

Write in plain language for potential clients:

- What this concern can feel like
- How counselling might help
- What you actually offer (without promising outcomes you cannot guarantee)

Delete lines like “This starter page can be revised…” — those are reminders for template users.

### Remove a specialty

Delete its `.md` file from `src/content/specialties/`. The page will disappear on the next build.

### Tips

- Keep one main topic per file
- Use short paragraphs; many visitors skim on phones
- Align specialty topics with what you truthfully treat and want to be found for

---

## Part 6: How to write blog posts

Blog posts are optional. Turn the blog on in `site.ts` (`pages.blog.enabled: true`) when you are ready.

**Folder:** `src/content/blog/`

### Add a new post

1. Copy `what-to-expect-in-a-first-session.md` to a new file
2. Name the file with **lowercase words and hyphens**, e.g. `managing-holiday-stress.md`
3. Update frontmatter and body

### Frontmatter

```yaml
---
title: Managing Holiday Stress
description: A short summary for the blog list and search engines.
pubDate: 2026-11-15
heroImage: /images/holiday-calm.jpg
draft: false
---
```

| Field | Purpose |
| --- | --- |
| `title` | Post headline |
| `description` | Blurb on the blog index |
| `pubDate` | Publication date (`YYYY-MM-DD`) |
| `heroImage` | Optional top image |
| `draft` | Set `true` to hide while writing; `false` to publish |

### Body

Write normally in Markdown:

- `##` for section headings
- Blank lines between paragraphs
- No need for HTML

Good post ideas for a counselling practice:

- What to expect in a first session
- How to know if counselling is a good fit
- Normalizing anxiety, grief, or life transitions
- Practical coping skills (without replacing therapy)

### Remove a post

Delete the `.md` file or set `draft: true`.

---

## Part 7: Before you launch — final checklist

- [ ] `site.ts` — practice name, email, phone, location, images, social links
- [ ] `site.ts` — forms connected (`backend` not `demo`) OR external booking URL set
- [ ] `site.ts` — pages enabled/disabled as you want
- [ ] `theme.ts` — palette chosen
- [ ] `site.ts` — `sessionTypes` fees/descriptions and `fees.insuranceNotes`; `faq.ts` — accurate for your practice
- [ ] Home, About, Privacy, Specialties intro — no “template” or “starter” language
- [ ] Specialty `.md` files — your wording; remove template reminders
- [ ] Blog posts — only published posts you want public (`draft: false`)
- [ ] `src/pages/*.astro` — titles use your practice name, not “Counselling by Blank”
- [ ] `astro.config.mjs` — real domain URL
- [ ] Photos replaced in `public/images/`
- [ ] Test contact form — submit a message and confirm you receive it
- [ ] Test booking — built-in form or external link opens correctly
- [ ] Privacy policy reviewed for your jurisdiction and tools

---

## Getting help

- **Editing the site locally:** see “Quick start” in [README.md](README.md) (`npm install`, `npm run dev`)
- **Forms, calendar, deployment:** README technical sections
- **Something broke after a change:** undo the last edit, or compare your file to the original template

You do not need to understand the whole codebase — most ongoing updates are the files listed in this guide.
