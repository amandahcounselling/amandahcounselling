import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getSessionAvailabilityPublicFilePath,
  getSessionCalendarIcsFeedUrl,
  shouldRunCalendarAvailabilitySync,
} from '../src/config';
import { buildCalendarAvailabilityJson } from '../src/lib/calendar';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

async function main() {
  if (!shouldRunCalendarAvailabilitySync()) {
    console.log(
      'Calendar availability sync is disabled in site.ts (bookSession, calendar, or availabilitySync). Skipping.',
    );
    return;
  }

  const outputPath = getSessionAvailabilityPublicFilePath();
  const icsFeedUrl = getSessionCalendarIcsFeedUrl();

  if (!outputPath) {
    throw new Error('availabilitySync.jsonPath is not configured in site.ts.');
  }

  if (!icsFeedUrl) {
    throw new Error('icsFeedUrl is not configured in site.ts.');
  }

  const payload = await buildCalendarAvailabilityJson(icsFeedUrl);
  const absoluteOutputPath = resolve(rootDir, outputPath);

  mkdirSync(dirname(absoluteOutputPath), { recursive: true });
  writeFileSync(absoluteOutputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${outputPath} with ${payload.busy.length} busy intervals.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
