import { getSessionBookingBlockMinutes } from './session';

export type BusyInterval = {
  start: string;
  end: string;
};

export type AvailableSlot = {
  start: string;
  end: string;
  label: string;
};

export type BusinessHours = {
  /** 0 = Sunday through 6 = Saturday */
  days: number[];
  start: string;
  end: string;
};

export type SlotSearchOptions = {
  busyIntervals: BusyInterval[];
  businessHours: BusinessHours;
  timeZone: string;
  /** Total time that must be free on the calendar, including the scheduling buffer. */
  blockMinutes: number;
  /** Session length shown to clients in labels and form values. */
  sessionDurationMinutes: number;
  slotIntervalMinutes: number;
  lookaheadDays: number;
};

/**
 * Google Calendar embed settings may be pasted as a full iframe snippet or as a URL.
 * This helper always returns a URL suitable for an iframe `src` attribute.
 */
export function resolveGoogleCalendarEmbedUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch?.[1]) {
    return iframeSrcMatch[1];
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return '';
}

function decodeBase64CalendarId(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

export function resolveGoogleCalendarId(
  publicCalendarUrl: string,
  embedUrl: string,
): string {
  const embedSrc = resolveGoogleCalendarEmbedUrl(embedUrl);
  if (embedSrc) {
    try {
      const src = new URL(embedSrc).searchParams.get('src');
      if (src) {
        return decodeURIComponent(src);
      }
    } catch {
      // Ignore malformed embed URLs.
    }
  }

  if (publicCalendarUrl) {
    try {
      const url = new URL(publicCalendarUrl);
      const cid = url.searchParams.get('cid');
      if (cid) {
        return decodeBase64CalendarId(cid);
      }
    } catch {
      // Ignore malformed public calendar URLs.
    }
  }

  return '';
}

export function getGoogleCalendarIcsUrl(calendarId: string): string {
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
}

export function resolveGoogleCalendarIcsFeedUrl(
  publicCalendarUrl: string,
  embedUrl: string,
  icsFeedUrl = '',
): string {
  const configuredFeed = icsFeedUrl.trim();
  if (configuredFeed) {
    return configuredFeed;
  }

  if (publicCalendarUrl.includes('/ical/') && publicCalendarUrl.includes('.ics')) {
    return publicCalendarUrl;
  }

  const calendarId = resolveGoogleCalendarId(publicCalendarUrl, embedUrl);
  return calendarId ? getGoogleCalendarIcsUrl(calendarId) : '';
}

export function parseIcsBusyIntervals(icsText: string): BusyInterval[] {
  const unfolded = icsText.replace(/\r\n/g, '\n').replace(/\n /g, '');
  const events = unfolded.split('BEGIN:VEVENT').slice(1);
  const busyIntervals: BusyInterval[] = [];

  for (const rawEvent of events) {
    const event = rawEvent.split('END:VEVENT')[0] ?? '';
    const start = readIcsProperty(event, 'DTSTART');
    const end = readIcsProperty(event, 'DTEND');

    if (!start || !end) {
      continue;
    }

    const startDate = parseIcsDateTime(start.value, start.params.TZID);
    const endDate = parseIcsDateTime(end.value, end.params.TZID);

    if (!startDate || !endDate || endDate <= startDate) {
      continue;
    }

    busyIntervals.push({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  }

  return mergeBusyIntervals(busyIntervals);
}

function readIcsProperty(
  event: string,
  property: string,
): { value: string; params: Record<string, string> } | null {
  const line = event
    .split('\n')
    .find((entry) => entry.startsWith(`${property}`) || entry.startsWith(`${property};`));

  if (!line) {
    return null;
  }

  const [rawKey, ...valueParts] = line.split(':');
  const value = valueParts.join(':').trim();
  const params: Record<string, string> = {};
  const keyParts = rawKey.split(';').slice(1);

  for (const part of keyParts) {
    const [key, paramValue] = part.split('=');
    if (key && paramValue) {
      params[key] = paramValue;
    }
  }

  return { value, params };
}

function parseIcsDateTime(value: string, timeZone?: string): Date | null {
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    return zonedDateTimeToUtc(year, month, day, 0, 0, timeZone ?? 'UTC');
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, zulu] = match;

  if (zulu) {
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      ),
    );
  }

  return zonedDateTimeToUtc(
    Number(year),
    Number(month),
    Number(day),
    Number(hour),
    Number(minute),
    timeZone ?? 'UTC',
  );
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offsetMinutes * 60_000);
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  if (!parts || parts === 'GMT') {
    return 0;
  }

  const match = parts.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return sign * (hours * 60 + minutes);
}

function mergeBusyIntervals(intervals: BusyInterval[]): BusyInterval[] {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].sort(
    (left, right) => Date.parse(left.start) - Date.parse(right.start),
  );
  const merged: BusyInterval[] = [sorted[0]];

  for (const interval of sorted.slice(1)) {
    const current = merged[merged.length - 1];
    if (Date.parse(interval.start) <= Date.parse(current.end)) {
      if (Date.parse(interval.end) > Date.parse(current.end)) {
        current.end = interval.end;
      }
      continue;
    }

    merged.push({ ...interval });
  }

  return merged;
}

function parseClockTime(value: string): { hour: number; minute: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    weekday: weekdayMap[weekday] ?? 0,
  };
}

function formatSlotLabel(
  start: Date,
  end: Date,
  timeZone: string,
  sessionDurationMinutes: number,
): string {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)} (${sessionDurationMinutes} minutes)`;
}

export function findAvailableSlots(options: SlotSearchOptions): AvailableSlot[] {
  const businessStart = parseClockTime(options.businessHours.start);
  const businessEnd = parseClockTime(options.businessHours.end);

  if (!businessStart || !businessEnd) {
    return [];
  }

  const businessStartMinutes = businessStart.hour * 60 + businessStart.minute;
  const businessEndMinutes = businessEnd.hour * 60 + businessEnd.minute;

  if (businessEndMinutes <= businessStartMinutes) {
    return [];
  }

  const now = new Date();
  const slots: AvailableSlot[] = [];
  const busy = options.busyIntervals.map((interval) => ({
    start: Date.parse(interval.start),
    end: Date.parse(interval.end),
  }));

  for (let dayOffset = 0; dayOffset < options.lookaheadDays; dayOffset += 1) {
    const probe = new Date(now.getTime() + dayOffset * 86_400_000);
    const parts = getZonedDateParts(probe, options.timeZone);

    if (!options.businessHours.days.includes(parts.weekday)) {
      continue;
    }

    for (
      let minutes = businessStartMinutes;
      minutes + options.blockMinutes <= businessEndMinutes;
      minutes += options.slotIntervalMinutes
    ) {
      const slotStart = zonedDateTimeToUtc(
        parts.year,
        parts.month,
        parts.day,
        Math.floor(minutes / 60),
        minutes % 60,
        options.timeZone,
      );
      const blockEnd = new Date(slotStart.getTime() + options.blockMinutes * 60_000);
      const sessionEnd = new Date(
        slotStart.getTime() + options.sessionDurationMinutes * 60_000,
      );

      if (slotStart.getTime() <= now.getTime()) {
        continue;
      }

      const overlapsBusy = busy.some(
        (interval) => slotStart.getTime() < interval.end && blockEnd.getTime() > interval.start,
      );

      if (overlapsBusy) {
        continue;
      }

      slots.push({
        start: slotStart.toISOString(),
        end: sessionEnd.toISOString(),
        label: formatSlotLabel(
          slotStart,
          sessionEnd,
          options.timeZone,
          options.sessionDurationMinutes,
        ),
      });
    }
  }

  return slots;
}

export function findAvailableSlotsForSessionDuration(
  durationMinutes: number,
  options: Omit<SlotSearchOptions, 'blockMinutes' | 'sessionDurationMinutes'>,
): AvailableSlot[] {
  return findAvailableSlots({
    ...options,
    blockMinutes: getSessionBookingBlockMinutes(durationMinutes),
    sessionDurationMinutes: durationMinutes,
  });
}

export type CalendarAvailabilityJson = {
  generatedAt: string;
  sourceIcsFeedUrl: string;
  busy: BusyInterval[];
};

export function parseCalendarAvailabilityJson(
  value: unknown,
): CalendarAvailabilityJson {
  if (!value || typeof value !== 'object') {
    throw new Error('Calendar availability data is invalid.');
  }

  const record = value as Partial<CalendarAvailabilityJson>;

  if (!Array.isArray(record.busy)) {
    throw new Error('Calendar availability data is missing busy intervals.');
  }

  return {
    generatedAt: record.generatedAt ?? '',
    sourceIcsFeedUrl: record.sourceIcsFeedUrl ?? '',
    busy: record.busy,
  };
}

export async function fetchCalendarBusyIntervals(options: {
  availabilitySyncEnabled: boolean;
  availabilityJsonPath: string;
  icsFeedUrl: string;
  signal?: AbortSignal;
}): Promise<{ busy: BusyInterval[]; generatedAt?: string }> {
  if (options.availabilitySyncEnabled && options.availabilityJsonPath) {
    const response = await fetch(options.availabilityJsonPath, {
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load calendar availability (${response.status}). Run the calendar sync workflow or set availabilitySync.enabled to false.`,
      );
    }

    const payload = parseCalendarAvailabilityJson(await response.json());
    return {
      busy: payload.busy,
      generatedAt: payload.generatedAt || undefined,
    };
  }

  if (!options.icsFeedUrl) {
    throw new Error('Calendar feed URL is not configured.');
  }

  const busy = await fetchGoogleCalendarBusyIntervals(options.icsFeedUrl, {
    signal: options.signal,
  });

  return { busy };
}

export async function fetchGoogleCalendarBusyIntervals(
  icsFeedUrl: string,
  init?: RequestInit,
): Promise<BusyInterval[]> {
  const response = await fetch(icsFeedUrl, init);

  if (!response.ok) {
    throw new Error(`Unable to load calendar feed (${response.status}).`);
  }

  return parseIcsBusyIntervals(await response.text());
}

export async function loadSessionAvailabilitySlots(
  durationMinutes: number,
  options: {
    availabilitySyncEnabled: boolean;
    availabilityJsonPath: string;
    icsFeedUrl: string;
    businessHours: BusinessHours;
    timeZone: string;
    slotIntervalMinutes: number;
    lookaheadDays: number;
    signal?: AbortSignal;
  },
): Promise<{ slots: AvailableSlot[]; busy: BusyInterval[]; generatedAt?: string }> {
  const { busy, generatedAt } = await fetchCalendarBusyIntervals({
    availabilitySyncEnabled: options.availabilitySyncEnabled,
    availabilityJsonPath: options.availabilityJsonPath,
    icsFeedUrl: options.icsFeedUrl,
    signal: options.signal,
  });

  const slots = findAvailableSlotsForSessionDuration(durationMinutes, {
    busyIntervals: busy,
    businessHours: options.businessHours,
    timeZone: options.timeZone,
    slotIntervalMinutes: options.slotIntervalMinutes,
    lookaheadDays: options.lookaheadDays,
  });

  return { slots, busy, generatedAt };
}

export async function buildCalendarAvailabilityJson(
  icsFeedUrl: string,
): Promise<CalendarAvailabilityJson> {
  const busy = await fetchGoogleCalendarBusyIntervals(icsFeedUrl);

  return {
    generatedAt: new Date().toISOString(),
    sourceIcsFeedUrl: icsFeedUrl,
    busy,
  };
}
