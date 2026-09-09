import { useEffect, useState } from 'react';
import {
  getSessionAvailabilityJsonPath,
  getSessionCalendarIcsFeedUrl,
  isSessionAvailabilitySyncEnabled,
  siteConfig,
} from '../config';
import type { AvailableSlot, BusyInterval } from '../lib/calendar';
import { loadSessionAvailabilitySlots } from '../lib/calendar';

export type AvailabilityState = 'idle' | 'loading' | 'ready' | 'error';

export function useSessionAvailability(
  durationMinutes: number,
  enabled: boolean,
) {
  const { calendar } = siteConfig.forms.bookSession;
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [state, setState] = useState<AvailabilityState>(
    enabled ? 'loading' : 'idle',
  );
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');

  useEffect(() => {
    if (!enabled || !durationMinutes) {
      setSlots([]);
      setBusy([]);
      setGeneratedAt('');
      setState('idle');
      setError('');
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setState('loading');
      setError('');

      try {
        const result = await loadSessionAvailabilitySlots(durationMinutes, {
          availabilitySyncEnabled: isSessionAvailabilitySyncEnabled(),
          availabilityJsonPath: getSessionAvailabilityJsonPath(),
          icsFeedUrl: getSessionCalendarIcsFeedUrl(),
          businessHours: calendar.businessHours,
          timeZone: calendar.timeZone,
          slotIntervalMinutes: calendar.slotIntervalMinutes,
          lookaheadDays: calendar.lookaheadDays,
          signal: controller.signal,
        });

        setSlots(result.slots);
        setBusy(result.busy);
        setGeneratedAt(result.generatedAt ?? '');
        setState('ready');
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setSlots([]);
        setBusy([]);
        setGeneratedAt('');
        setState('error');
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load available times.',
        );
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, [
    calendar.businessHours,
    calendar.lookaheadDays,
    calendar.slotIntervalMinutes,
    calendar.timeZone,
    durationMinutes,
    enabled,
  ]);

  return {
    slots,
    busy,
    generatedAt,
    state,
    error,
  };
}
