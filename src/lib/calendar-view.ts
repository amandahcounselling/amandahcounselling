import type { BusyInterval, BusinessHours } from './calendar';

export const HOUR_HEIGHT_PX = 56;

export type CalendarDay = {
  date: Date;
  key: string;
  weekday: number;
  label: string;
  shortLabel: string;
};

export type PositionedBlock<T> = T & {
  top: number;
  height: number;
};

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getWeekStart(
  date: Date,
  weekStartsOn: number,
  timeZone: string,
): Date {
  const parts = getZonedDateParts(date, timeZone);
  const offset = (parts.weekday - weekStartsOn + 7) % 7;

  return zonedDateTimeToUtc(
    parts.year,
    parts.month,
    parts.day - offset,
    0,
    0,
    timeZone,
  );
}

export function getVisibleBusinessDays(
  weekStart: Date,
  businessHours: BusinessHours,
  timeZone: string,
): CalendarDay[] {
  const days: CalendarDay[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    const parts = getZonedDateParts(date, timeZone);

    if (!businessHours.days.includes(parts.weekday)) {
      continue;
    }

    days.push({
      date,
      key: formatDateKey(date, timeZone),
      weekday: parts.weekday,
      label: new Intl.DateTimeFormat('en-CA', {
        timeZone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date),
      shortLabel: new Intl.DateTimeFormat('en-CA', {
        timeZone,
        weekday: 'short',
        day: 'numeric',
      }).format(date),
    });
  }

  return days;
}

export function getTimeLabels(
  businessHours: BusinessHours,
  timeZone: string,
): { minutes: number; label: string }[] {
  const start = parseClockTime(businessHours.start);
  const end = parseClockTime(businessHours.end);

  if (!start || !end) {
    return [];
  }

  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  const labels: { minutes: number; label: string }[] = [];

  for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
    const date = zonedDateTimeToUtc(2026, 1, 1, Math.floor(minutes / 60), minutes % 60, timeZone);
    labels.push({
      minutes,
      label: new Intl.DateTimeFormat('en-CA', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
      }).format(date),
    });
  }

  return labels;
}

export function getDayGridHeightPx(businessHours: BusinessHours): number {
  const start = parseClockTime(businessHours.start);
  const end = parseClockTime(businessHours.end);

  if (!start || !end) {
    return HOUR_HEIGHT_PX * 8;
  }

  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  return ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX;
}

export function positionBlockInDayGrid(options: {
  start: string;
  end: string;
  businessHours: BusinessHours;
  timeZone: string;
}): { top: number; height: number } | null {
  const businessStart = parseClockTime(options.businessHours.start);
  const businessEnd = parseClockTime(options.businessHours.end);

  if (!businessStart || !businessEnd) {
    return null;
  }

  const startParts = getZonedDateParts(new Date(options.start), options.timeZone);
  const endParts = getZonedDateParts(new Date(options.end), options.timeZone);
  const businessStartMinutes = businessStart.hour * 60 + businessStart.minute;
  const businessEndMinutes = businessEnd.hour * 60 + businessEnd.minute;
  const startMinutes = startParts.hour * 60 + startParts.minute;
  const endMinutes = endParts.hour * 60 + endParts.minute;
  const visibleStart = Math.max(startMinutes, businessStartMinutes);
  const visibleEnd = Math.min(endMinutes, businessEndMinutes);
  const businessMinutes = businessEndMinutes - businessStartMinutes;

  if (businessMinutes <= 0 || visibleEnd <= visibleStart) {
    return null;
  }

  return {
    top: ((visibleStart - businessStartMinutes) / businessMinutes) * 100,
    height: ((visibleEnd - visibleStart) / businessMinutes) * 100,
  };
}

export function groupIntervalsByDay<T extends { start: string; end: string }>(
  intervals: T[],
  days: CalendarDay[],
  timeZone: string,
): Record<string, T[]> {
  const dayKeys = new Set(days.map((day) => day.key));
  const grouped: Record<string, T[]> = Object.fromEntries(
    days.map((day) => [day.key, []]),
  );

  for (const interval of intervals) {
    const key = formatDateKey(new Date(interval.start), timeZone);
    if (dayKeys.has(key)) {
      grouped[key].push(interval);
    }
  }

  return grouped;
}

export function formatWeekRange(days: CalendarDay[], timeZone: string): string {
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;

  if (!first || !last) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    month: 'short',
    day: 'numeric',
  });

  return `${formatter.format(first)} – ${formatter.format(last)}`;
}

export function findNextWeekWithSlots(
  currentWeekStart: Date,
  slots: { start: string }[],
  weekStartsOn: number,
  timeZone: string,
): Date | null {
  for (const slot of slots) {
    const slotWeekStart = getWeekStart(new Date(slot.start), weekStartsOn, timeZone);
    if (slotWeekStart.getTime() > currentWeekStart.getTime()) {
      return slotWeekStart;
    }
  }

  return null;
}

export function formatDateKey(date: Date, timeZone: string): string {
  const parts = getZonedDateParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function getTodayDateKey(timeZone: string): string {
  return formatDateKey(new Date(), timeZone);
}

export function clampWeekStartToMinimum(
  weekStart: Date,
  minWeekStart: Date,
): Date {
  return weekStart.getTime() < minWeekStart.getTime() ? minWeekStart : weekStart;
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
