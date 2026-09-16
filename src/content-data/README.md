# Content data

Edit site copy here. You usually do **not** need to change React or Astro files for text updates.

## What’s in this folder

| File | What it controls |
|------|------------------|
| `practice.json` | Practice name, contact info, images, fees, nav labels, form copy |
| `faq.json` | FAQ questions and answers |
| `pages/*.json` | Per-page marketing copy (home, about, contact, etc.) |

Longer specialty and blog articles live in `src/content/` as markdown files, not here.

## Page files (`pages/*.json`)

Most pages look like this:

```json
{
  "meta": {
    "description": "SEO description for search/social previews"
  },
  "shell": {
    "eyebrow": "Short label above the title",
    "title": "Page headline",
    "description": "Intro under the title"
  },
  "sections": []
}
```

- **`meta.description`** — browser/SEO description for that page. Home omits this and uses `practice.json` → `description` instead.
- **`shell`** — top-of-page banner (eyebrow, title, description). The home page has no `shell`; its top block is a `hero` section instead.
- **`sections`** — ordered list of content blocks. Order in the file = order on the page.

Some pages also have extra keys (for example `sidebar` on contact/book, or privacy’s `contactHeading`). Edit those strings the same way; leave the key names as they are.

## Section types

Each item in `sections` needs a `"type"`. Copy an existing block from another page when unsure.

### `prose` — headings and paragraphs

```json
{
  "type": "prose",
  "title": "Optional heading",
  "paragraphs": [
    "First paragraph.",
    "Second paragraph."
  ],
  "withImage": true
}
```

- Add or remove strings in `paragraphs` to grow/shrink the copy.
- `"withImage": true` shows the about image beside the text (used on About). Omit it or set `false` for a normal text block.

### `cards` — title + card grid

```json
{
  "type": "cards",
  "eyebrow": "Optional label",
  "title": "Section title",
  "description": "Optional intro",
  "items": [
    { "title": "Card title", "description": "Card body" }
  ]
}
```

### `bullets` — title + checklist-style lines

```json
{
  "type": "bullets",
  "eyebrow": "Optional label",
  "title": "Section title",
  "description": "Optional intro",
  "items": [
    "First point",
    "Second point"
  ]
}
```

### `hero` — home page top (home only)

```json
{
  "type": "hero",
  "eyebrow": "…",
  "subtitle": "…",
  "specialtiesCta": "View Specialties"
}
```

The main headline comes from `practice.json` (`tagline`), not this block.

### `specialtiesPreview` — home specialty cards

Pulls specialty titles/descriptions from markdown in `src/content/specialties/`. This JSON only controls the section labels.

### `cta` — closing call-to-action

```json
{
  "type": "cta",
  "title": "…",
  "description": "…"
}
```

## Common edits

### Change existing text

Open the right JSON file, find the string, change it, save. Keep the quotes and commas valid.

### Add a paragraph or list item

Add another string (or card object) to the array:

```json
"paragraphs": [
  "Existing paragraph.",
  "New paragraph."
]
```

### Remove a paragraph or list item

Delete that array entry (and its trailing comma if needed).

### Add a section

Copy a whole `{ "type": "…", … }` object into `sections` where you want it to appear. Example — add another prose block on About after the intro:

```json
"sections": [
  { "type": "prose", "withImage": true, "title": "…", "paragraphs": ["…"] },
  {
    "type": "prose",
    "title": "New section",
    "paragraphs": ["New copy goes here."]
  }
]
```

### Remove a section

Delete that entire object from the `sections` array.

### Reorder sections

Move the objects up or down in the `sections` array.

## Empty / blank values

To hide a field without removing the key, set it to an empty string:

```json
"description": ""
```

Blank (or whitespace-only) values are not shown and do not leave empty space on the page.

Prefer `""` over deleting required keys, unless you know the field is optional. Optional fields (like a cards `eyebrow`) can also simply be omitted.

## Markdown in strings

Body copy fields support common markdown. Write it inline in the JSON string; the site converts it when rendering the page.

```json
"paragraphs": [
  "I offer **trauma-informed** care with a focus on _eating disorders_.",
  "Support can include:\n\n- Anxiety\n- Depression\n- Life transitions",
  "Email me at [hello@example.com](mailto:hello@example.com)."
]
```

Supported formatting:

- `**bold**` and `_italic_` (or `*italic*`)
- Lists with `-` or `1.` (use `\n` between lines inside one string)
- Links: `[label](https://example.com)`

Where it works:

- `prose.paragraphs`
- Section and card `description` fields
- `bullets` item lines
- FAQ `answer` values
- Sidebar / insurance-note style body copy

Where it does **not** apply (kept as plain text): titles, eyebrows, CTA labels, nav labels, and SEO `meta.description`.

Authoring tips:

- JSON strings cannot contain raw line breaks — use `\n` (and `\n\n` between a lead-in sentence and a list).
- Prefer one idea per `paragraphs[]` entry; put a markdown list inside an entry when you need bullets in prose.
- Keep using the `bullets` section type when you want the checklist UI with check icons.
- Escape double quotes inside strings as `\"`.
- Run `npm run validate:content` after edits.

## JSON tips (avoid broken pages)

1. Use straight double quotes: `"like this"`.
2. Commas between items, **no** comma after the last item in a list/object.
3. Don’t leave comments in JSON (`//` is not allowed).
4. If the site fails to build, check for a missing comma or quote — start with the file you just edited.
5. Run `npm run validate:content` to verify shapes against the schemas in this folder.

## What not to change here

- Turning pages on/off, booking backends, and similar site structure → `src/config/` (developer config).
- Specialty/blog article bodies → `src/content/specialties/` and `src/content/blog/`.
- New layout types beyond the section types above → needs a developer to extend the renderer.
