/** Buffer added to each session duration when checking calendar availability. */
export const SESSION_BUFFER_MINUTES = 10;

export type SessionDeliveryMode = 'virtual' | 'in_person';

export const SESSION_DELIVERY_MODE_LABELS: Record<SessionDeliveryMode, string> = {
  virtual: 'Virtual',
  in_person: 'In person',
};

export type BookingKind = 'consultation' | 'session';

export type SessionTypeConfig = {
  label: string;
  durationMinutes: number;
  fee: string;
  description: string;
  modes: SessionDeliveryMode[];
  kind: BookingKind;
};

export function getSessionBookingBlockMinutes(durationMinutes: number): number {
  return durationMinutes + SESSION_BUFFER_MINUTES;
}

export function formatSessionDuration(durationMinutes: number): string {
  return `${durationMinutes} minutes`;
}

export function getSessionDeliveryModeLabel(mode: SessionDeliveryMode): string {
  return SESSION_DELIVERY_MODE_LABELS[mode];
}

export function formatSessionTypeOption(session: SessionTypeConfig): string {
  return `${session.label} — ${formatSessionDuration(session.durationMinutes)} — ${session.fee}`;
}

export function getSessionDeliveryModeOptions(modes: SessionDeliveryMode[]) {
  return modes.map((mode) => {
    const label = getSessionDeliveryModeLabel(mode);
    return { value: label, label };
  });
}
