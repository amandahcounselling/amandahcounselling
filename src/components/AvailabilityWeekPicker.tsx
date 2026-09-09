import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import type { AvailableSlot, BusyInterval, BusinessHours } from '../lib/calendar';
import {
  addDays,
  clampWeekStartToMinimum,
  findNextWeekWithSlots,
  formatDateKey,
  formatWeekRange,
  getDayGridHeightPx,
  getTimeLabels,
  getTodayDateKey,
  getVisibleBusinessDays,
  getWeekStart,
  groupIntervalsByDay,
  HOUR_HEIGHT_PX,
  positionBlockInDayGrid,
} from '../lib/calendar-view';

type AvailabilityWeekPickerProps = {
  slots: AvailableSlot[];
  busy: BusyInterval[];
  selectedStart: string;
  onSelect: (slot: AvailableSlot) => void;
  businessHours: BusinessHours;
  timeZone: string;
  weekStartsOn: number;
  sessionDurationMinutes: number;
  state: 'idle' | 'loading' | 'ready' | 'error';
  error: string;
  generatedAt?: string;
};

export default function AvailabilityWeekPicker({
  slots,
  busy,
  selectedStart,
  onSelect,
  businessHours,
  timeZone,
  weekStartsOn,
  sessionDurationMinutes,
  state,
  error,
  generatedAt,
}: AvailabilityWeekPickerProps) {
  const minWeekStart = useMemo(
    () => getWeekStart(new Date(), weekStartsOn, timeZone),
    [timeZone, weekStartsOn],
  );
  const initialWeekStart = useMemo(
    () => minWeekStart,
    [minWeekStart],
  );
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [mobileDayKey, setMobileDayKey] = useState('');

  const clampToNavigableWeek = (week: Date) =>
    clampWeekStartToMinimum(week, minWeekStart);

  useEffect(() => {
    const todayKey = getTodayDateKey(timeZone);

    if (selectedStart) {
      const selectedDate = new Date(selectedStart);
      setWeekStart(
        clampToNavigableWeek(getWeekStart(selectedDate, weekStartsOn, timeZone)),
      );
      setMobileDayKey(formatDayKey(selectedDate, timeZone));
      return;
    }

    const firstSlot = slots[0];
    if (firstSlot) {
      const firstSlotDate = new Date(firstSlot.start);
      setWeekStart(
        clampToNavigableWeek(getWeekStart(firstSlotDate, weekStartsOn, timeZone)),
      );
      setMobileDayKey(formatDayKey(firstSlotDate, timeZone));
      return;
    }

    const currentDays = getVisibleBusinessDays(minWeekStart, businessHours, timeZone);
    const firstNavigableDay =
      currentDays.find((day) => day.key >= todayKey) ?? currentDays[0];

    setWeekStart(minWeekStart);
    setMobileDayKey(firstNavigableDay?.key ?? '');
  }, [selectedStart, slots, timeZone, weekStartsOn, minWeekStart, businessHours]);

  const days = useMemo(
    () => getVisibleBusinessDays(weekStart, businessHours, timeZone),
    [businessHours, timeZone, weekStart],
  );
  const todayKey = getTodayDateKey(timeZone);
  const navigableDays = useMemo(() => {
    if (weekStart.getTime() > minWeekStart.getTime()) {
      return days;
    }

    return days.filter((day) => day.key >= todayKey);
  }, [days, minWeekStart, todayKey, weekStart]);
  const weekRange = formatWeekRange(navigableDays, timeZone);
  const timeLabels = getTimeLabels(businessHours, timeZone);
  const gridHeight = getDayGridHeightPx(businessHours);
  const slotsByDay = groupIntervalsByDay(slots, days, timeZone);
  const busyByDay = groupIntervalsByDay(busy, days, timeZone);
  const mobileDay =
    navigableDays.find((day) => day.key === mobileDayKey) ??
    navigableDays.find((day) => day.key >= todayKey) ??
    navigableDays[0];
  const mobileDays = mobileDay ? [mobileDay] : [];
  const selectedSlot = slots.find((slot) => slot.start === selectedStart);
  const weekHasSlots = navigableDays.some(
    (day) => (slotsByDay[day.key] ?? []).length > 0,
  );
  const nextWeekWithSlots = findNextWeekWithSlots(
    weekStart,
    slots,
    weekStartsOn,
    timeZone,
  );
  const canGoToPreviousWeek = weekStart.getTime() > minWeekStart.getTime();
  const canGoToPreviousDay = useMemo(() => {
    const currentIndex = navigableDays.findIndex((day) => day.key === mobileDay?.key);

    if (currentIndex > 0) {
      return navigableDays[currentIndex - 1].key >= todayKey;
    }

    if (!canGoToPreviousWeek) {
      return false;
    }

    const previousWeekStart = addDays(weekStart, -7);
    const previousDays = getVisibleBusinessDays(
      previousWeekStart,
      businessHours,
      timeZone,
    );

    return previousDays.some((day) => day.key >= todayKey);
  }, [
    businessHours,
    canGoToPreviousWeek,
    navigableDays,
    mobileDay?.key,
    timeZone,
    todayKey,
    weekStart,
  ]);

  const goToPreviousWeek = () => {
    if (!canGoToPreviousWeek) {
      return;
    }

    setWeekStart((current) => clampToNavigableWeek(addDays(current, -7)));
  };
  const goToNextWeek = () => setWeekStart((current) => addDays(current, 7));
  const goToPreviousDay = () => {
    if (!canGoToPreviousDay) {
      return;
    }

    const currentIndex = navigableDays.findIndex((day) => day.key === mobileDay?.key);

    if (currentIndex > 0) {
      const previousDay = navigableDays[currentIndex - 1];
      if (previousDay.key >= todayKey) {
        setMobileDayKey(previousDay.key);
      }
      return;
    }

    const previousWeekStart = addDays(weekStart, -7);
    const previousDays = getVisibleBusinessDays(
      previousWeekStart,
      businessHours,
      timeZone,
    );
    const lastNavigableDay = [...previousDays]
      .reverse()
      .find((day) => day.key >= todayKey);

    if (!lastNavigableDay) {
      return;
    }

    setWeekStart(previousWeekStart);
    setMobileDayKey(lastNavigableDay.key);
  };
  const goToNextDay = () => {
    const currentIndex = navigableDays.findIndex((day) => day.key === mobileDay?.key);

    if (currentIndex >= 0 && currentIndex < navigableDays.length - 1) {
      setMobileDayKey(navigableDays[currentIndex + 1].key);
      return;
    }

    const nextWeekStart = addDays(weekStart, 7);
    const nextDays = getVisibleBusinessDays(nextWeekStart, businessHours, timeZone);

    setWeekStart(nextWeekStart);
    setMobileDayKey(nextDays[0]?.key ?? '');
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-foreground text-sm font-bold">Available time</span>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Select a {sessionDurationMinutes}-minute preferred session time. 
          Please select a time that works for you, and I will make my best effort to accomodate your request. However, my scheduling can be dynamic and is subject to change.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
              Availability
            </p>
            <h3 className="font-heading text-foreground text-2xl font-bold">
              <span className="hidden sm:inline">
                {weekRange || 'Available openings'}
              </span>
              <span className="sm:hidden">
                {mobileDay?.label ?? 'Available openings'}
              </span>
            </h3>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={goToPreviousWeek}
              disabled={!canGoToPreviousWeek}
              className="border-border hover:bg-secondary/40 rounded-full border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Show previous week"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNextWeek}
              className="border-border hover:bg-secondary/40 rounded-full border p-2 transition-colors"
              aria-label="Show next week"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex gap-2 sm:hidden">
            <button
              type="button"
              onClick={goToPreviousDay}
              disabled={!canGoToPreviousDay}
              className="border-border hover:bg-secondary/40 rounded-full border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Show previous available day"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNextDay}
              className="border-border hover:bg-secondary/40 rounded-full border p-2 transition-colors"
              aria-label="Show next available day"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="sm:hidden">
          <CalendarGrid
            days={mobileDays}
            slotsByDay={slotsByDay}
            busyByDay={busyByDay}
            selectedStart={selectedStart}
            onSelect={onSelect}
            businessHours={businessHours}
            timeZone={timeZone}
            timeLabels={timeLabels}
            gridHeight={gridHeight}
          />
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <CalendarGrid
            days={navigableDays}
            slotsByDay={slotsByDay}
            busyByDay={busyByDay}
            selectedStart={selectedStart}
            onSelect={onSelect}
            businessHours={businessHours}
            timeZone={timeZone}
            timeLabels={timeLabels}
            gridHeight={gridHeight}
          />
        </div>


        <div className="space-y-3 border-t border-border p-4">
          {state === 'loading' && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading available times...
            </p>
          )}

          {state === 'error' && (
            <p className="text-destructive text-sm leading-relaxed">{error}</p>
          )}

          {state === 'ready' && !weekHasSlots && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                No matching openings are available this week.
              </p>
              {nextWeekWithSlots && (
                <button
                  type="button"
                  onClick={() => setWeekStart(nextWeekWithSlots)}
                  className="text-primary text-sm font-bold"
                >
                  Jump to the next week with openings
                </button>
              )}
            </div>
          )}

          {selectedSlot && (
            <p className="text-foreground text-sm font-bold">
              Selected: {selectedSlot.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type CalendarGridProps = {
  days: ReturnType<typeof getVisibleBusinessDays>;
  slotsByDay: Record<string, AvailableSlot[]>;
  busyByDay: Record<string, BusyInterval[]>;
  selectedStart: string;
  onSelect: (slot: AvailableSlot) => void;
  businessHours: BusinessHours;
  timeZone: string;
  timeLabels: { minutes: number; label: string }[];
  gridHeight: number;
};

function CalendarGrid({
  days,
  slotsByDay,
  busyByDay,
  selectedStart,
  onSelect,
  businessHours,
  timeZone,
  timeLabels,
  gridHeight,
}: CalendarGridProps) {
  return (
    <div
      className={clsx('grid', days.length > 1 && 'min-w-[42rem]')}
      style={{
        gridTemplateColumns: `4.5rem repeat(${Math.max(days.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      <div className="sticky left-0 z-20 border-b border-r border-border bg-background" />
      {days.map((day) => (
        <div
          key={day.key}
          className="border-b border-r border-border bg-background p-3 text-center last:border-r-0"
        >
          <p className="text-foreground text-sm font-bold">{day.label}</p>
        </div>
      ))}

      <div
        className="sticky left-0 z-20 border-r border-border bg-background"
        style={{ height: gridHeight }}
      >
        {timeLabels.map((label) => (
          <div
            key={label.minutes}
            className="border-b border-border px-2 text-right text-xs text-muted-foreground"
            style={{ height: HOUR_HEIGHT_PX }}
          >
            {label.label}
          </div>
        ))}
      </div>

      {days.map((day) => {
        const daySlots = slotsByDay[day.key] ?? [];
        const dayBusy = busyByDay[day.key] ?? [];

        return (
          <div
            key={day.key}
            className="relative border-r border-border bg-secondary/10 last:border-r-0"
            style={{ height: gridHeight }}
          >
            {timeLabels.map((label) => (
              <div
                key={label.minutes}
                className="border-b border-border/70"
                style={{ height: HOUR_HEIGHT_PX }}
              />
            ))}

            {dayBusy.map((interval) => {
              const position = positionBlockInDayGrid({
                start: interval.start,
                end: interval.end,
                businessHours,
                timeZone,
              });

              if (!position) {
                return null;
              }

              return (
                <div
                  key={`${interval.start}-${interval.end}`}
                  className="absolute left-2 right-2 rounded-xl bg-muted/70"
                  style={{
                    top: `${position.top}%`,
                    height: `${position.height}%`,
                  }}
                  aria-hidden="true"
                />
              );
            })}

            {daySlots.map((slot) => {
              const position = positionBlockInDayGrid({
                start: slot.start,
                end: slot.end,
                businessHours,
                timeZone,
              });

              if (!position) {
                return null;
              }

              const isSelected = selectedStart === slot.start;

              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => onSelect(slot)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${slot.label}`}
                  className={clsx(
                    'absolute left-2 right-2 z-10 rounded-full border px-2 py-1 text-center text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/30 bg-primary/15 text-primary hover:bg-primary/25',
                  )}
                  style={{
                    top: `calc(${position.top}% + 0.2rem)`,
                  }}
                >
                  <span className="block truncate">
                    {formatSlotStartTime(slot, timeZone)}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatSlotStartTime(slot: AvailableSlot, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  });

  return formatter.format(new Date(slot.start));
}

function formatDayKey(date: Date, timeZone: string) {
  return formatDateKey(date, timeZone);
}
