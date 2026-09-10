import { readFileSync } from 'node:fs';

/**
 * Lightweight site.structural.ts check for GitHub Actions (no npm install required).
 * Keep aligned with shouldRunCalendarAvailabilitySync() in src/config/site.internal.ts.
 */
function readSiteConfigSource() {
  return readFileSync('src/config/site.structural.ts', 'utf8');
}

function readBooleanFlag(source, pattern) {
  const match = source.match(pattern);
  return match?.[1] === 'true';
}

function shouldRunCalendarAvailabilitySyncFromSource(source) {
  // Match bookSession.backend (not forms.backend). Only built-in booking runs sync.
  const bookSessionBackend = source.match(
    /bookSession:\s*\{[\s\S]*?backend:\s*['"`]([^'"`]+)['"`]/,
  )?.[1];
  if (bookSessionBackend !== 'built-in') {
    return false;
  }

  const calendarEnabled = readBooleanFlag(
    source,
    /calendar:\s*\{[\s\S]*?enabled:\s*(true|false)/,
  );
  const availabilitySyncEnabled = readBooleanFlag(
    source,
    /availabilitySync:\s*\{[\s\S]*?enabled:\s*(true|false)/,
  );
  const hasJsonPath = /jsonPath:\s*['"`][^'"`]+['"`]/.test(source);
  const hasIcsFeedUrl = /icsFeedUrl:\s*['"`]https?:\/\/[^'"`]+['"`]/.test(source);

  return calendarEnabled && availabilitySyncEnabled && hasJsonPath && hasIcsFeedUrl;
}

const enabled = shouldRunCalendarAvailabilitySyncFromSource(readSiteConfigSource());
process.stdout.write(enabled ? 'true' : 'false');
