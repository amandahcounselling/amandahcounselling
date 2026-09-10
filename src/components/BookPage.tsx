import { CalendarCheck, CheckCircle, ExternalLink, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  getBookConsultationToggleLabel,
  getSessionBookingDescription,
  getSessionCalendarEmbedUrl,
  getSessionTypesByKind,
  isPhoneEnabled,
  isSessionAvailabilityPickerEnabled,
  isSessionCalendarActive,
  siteConfig,
  type FormKind,
} from '../config';
import { isExternalBookingEnabled } from '../lib/booking';
import { useSessionAvailability, type AvailabilityState } from '../hooks/useSessionAvailability';
import { getFormSettings, getFormSubject } from '../lib/forms';
import type { AvailableSlot, BusyInterval } from '../lib/calendar';
import {
  formatSessionTypeOption,
  getSessionDeliveryModeLabel,
  getSessionDeliveryModeOptions,
  type SessionDeliveryMode,
} from '../lib/session';
import AvailabilityWeekPicker from './AvailabilityWeekPicker';
import SharedField from './admin/SharedField';
import { pageContent } from '../lib/content';
import CaptchaField from './CaptchaField';
import FormDisabledMessage from './FormDisabledMessage';
import PageShell from './PageShell';

type BookingMode = 'consultation' | 'session';

const bookPageContent = pageContent.book;

export default function BookPage() {
  if (isExternalBookingEnabled()) {
    return <ExternalBookingPage />;
  }

  const sessionConfig = siteConfig.forms.bookSession;
  const calendarActive = isSessionCalendarActive();
  const pickerEnabled = isSessionAvailabilityPickerEnabled();
  const consultationToggleLabel = getBookConsultationToggleLabel();
  const modes = [
    { id: 'consultation' as const, label: consultationToggleLabel },
    ...(sessionConfig.enabled
      ? [{ id: 'session' as const, label: sessionConfig.label }]
      : []),
  ];
  const [activeMode, setActiveMode] = useState<BookingMode>(modes[0].id);
  const [submittedMode, setSubmittedMode] = useState<BookingMode | null>(null);

  const formKind: FormKind = activeMode === 'session' ? 'session' : 'booking';
  const formSettings = getFormSettings(formKind);
  const isSession = activeMode === 'session';
  const pageCopy = isSession
    ? { ...sessionConfig, description: getSessionBookingDescription() }
    : sessionConfig.consultationCopy;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!formSettings.isDemo) {
      return;
    }

    event.preventDefault();
    setSubmittedMode(activeMode);
    event.currentTarget.reset();
  };

  const resetSubmission = () => setSubmittedMode(null);

  return (
    <PageShell
      eyebrow={bookPageContent.shell.eyebrow}
      title={bookPageContent.shell.title}
      description={
        calendarActive
          ? bookPageContent.shell.descriptionWithCalendar
          : bookPageContent.shell.description
      }
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="bg-secondary text-secondary-foreground h-fit rounded-[2rem] p-8">
            <CalendarCheck className="mb-5 h-10 w-10" />
            <h2 className="font-heading text-3xl font-bold">
              {isSession
                ? bookPageContent.sidebar.sessionHeading
                : bookPageContent.sidebar.consultationHeading}
            </h2>
            <p className="mt-4 leading-relaxed">
              {isSession
                ? pageCopy.description
                : bookPageContent.sidebar.consultationDescription}
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-bold">{bookPageContent.sidebar.responseTimeLabel}</dt>
                <dd>
                  <SharedField path="responseTime" fallback={siteConfig.responseTime} />
                </dd>
              </div>
              <div>
                <dt className="font-bold">{bookPageContent.sidebar.availabilityLabel}</dt>
                <dd>
                  <SharedField path="hours" fallback={siteConfig.hours} />
                </dd>
              </div>
              {calendarActive && (
                <div>
                  <dt className="font-bold">{bookPageContent.sidebar.timeZoneLabel}</dt>
                  <dd>{sessionConfig.calendar.timeZone}</dd>
                </div>
              )}
            </dl>
          </aside>

          <div className="space-y-6">
            {modes.length > 1 && (
              <div className="bg-card grid gap-2 rounded-full border border-border p-2 shadow-sm sm:grid-cols-2">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setActiveMode(mode.id);
                      setSubmittedMode(null);
                    }}
                    className={`rounded-full px-5 py-3 text-sm font-bold transition-colors ${
                      activeMode === mode.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}

            {isSession && calendarActive && !pickerEnabled && <SessionAvailability />}

            <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm md:p-8">
              {formSettings.hidesForm ? (
                <FormDisabledMessage context="booking" />
              ) : submittedMode === activeMode ? (
                <SubmissionSuccess
                  isSession={isSession}
                  message={
                    isSession
                      ? sessionConfig.confirmationMessage
                      : sessionConfig.consultationSuccessMessage
                  }
                  onReset={resetSubmission}
                />
              ) : isSession ? (
                <SessionForm
                  calendarActive={calendarActive}
                  pickerEnabled={pickerEnabled}
                  formSettings={formSettings}
                  onSubmit={handleSubmit}
                />
              ) : (
                <ConsultationForm
                  calendarActive={calendarActive}
                  pickerEnabled={pickerEnabled}
                  formSettings={formSettings}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ExternalBookingPage() {
  const { externalLink } = siteConfig.forms.bookSession;

  return (
    <PageShell
      eyebrow={bookPageContent.shell.eyebrow}
      title={bookPageContent.shell.title}
      description={bookPageContent.external.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="bg-secondary text-secondary-foreground h-fit rounded-[2rem] p-8">
            <CalendarCheck className="mb-5 h-10 w-10" />
            <h2 className="font-heading text-3xl font-bold">
              {bookPageContent.sidebar.consultationHeading}
            </h2>
            <p className="mt-4 leading-relaxed">{bookPageContent.sidebar.externalDescription}</p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-bold">{bookPageContent.sidebar.responseTimeLabel}</dt>
                <dd>
                  <SharedField path="responseTime" fallback={siteConfig.responseTime} />
                </dd>
              </div>
              <div>
                <dt className="font-bold">{bookPageContent.sidebar.availabilityLabel}</dt>
                <dd>
                  <SharedField path="hours" fallback={siteConfig.hours} />
                </dd>
              </div>
            </dl>
          </aside>

          <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm md:p-10">
            <p className="text-muted-foreground leading-relaxed">
              {externalLink.description}
            </p>
            <a
              href={externalLink.url}
              target="_blank"
              rel="noreferrer"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-center font-bold shadow-sm transition-colors sm:w-auto"
            >
              {externalLink.label}
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

type FormSettings = ReturnType<typeof getFormSettings>;

type FormProps = {
  formSettings: FormSettings;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

type SessionFormProps = FormProps & {
  calendarActive: boolean;
  pickerEnabled: boolean;
};

type ConsultationFormProps = FormProps & {
  calendarActive: boolean;
  pickerEnabled: boolean;
};

function ConsultationForm({
  calendarActive,
  pickerEnabled,
  formSettings,
  onSubmit,
}: ConsultationFormProps) {
  const sessionConfig = siteConfig.forms.bookSession;
  const { calendar } = sessionConfig;
  const consultationTypes = getSessionTypesByKind('consultation');
  const [selectedConsultationIndex, setSelectedConsultationIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDeliveryMode, setSelectedDeliveryMode] =
    useState<SessionDeliveryMode>('virtual');

  const selectedConsultation =
    consultationTypes[selectedConsultationIndex] ?? consultationTypes[0];
  const {
    slots,
    busy,
    generatedAt: availabilityGeneratedAt,
    state: slotsState,
    error: slotsError,
  } = useSessionAvailability(
    selectedConsultation?.durationMinutes ?? 0,
    calendarActive && Boolean(selectedConsultation),
  );

  useEffect(() => {
    setSelectedSlot('');
  }, [selectedConsultation?.durationMinutes]);

  const deliveryModeOptions = useMemo(
    () =>
      selectedConsultation
        ? getSessionDeliveryModeOptions(selectedConsultation.modes)
        : [],
    [selectedConsultation],
  );

  useEffect(() => {
    if (!selectedConsultation) {
      return;
    }

    const nextMode = selectedConsultation.modes[0] ?? 'virtual';
    setSelectedDeliveryMode(nextMode);
  }, [selectedConsultation]);

  const consultationOptions = useMemo(
    () =>
      consultationTypes.map((consultation) => ({
        value: formatSessionTypeOption(consultation),
        label: formatSessionTypeOption(consultation),
      })),
    [consultationTypes],
  );
  const selectedConsultationLabel = selectedConsultation
    ? formatSessionTypeOption(selectedConsultation)
    : '';

  return (
    <form
      action={formSettings.action || undefined}
      method="post"
      data-basin-form={formSettings.backend === 'usebasin' ? '' : undefined}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <input type="hidden" name="formKind" value="booking" />
      <input type="hidden" name="formLabel" value={getBookConsultationToggleLabel()} />
      <input type="hidden" name="_subject" value={getFormSubject('booking')} />
      <input type="hidden" name="provider" value={formSettings.backend} />
      {calendarActive && (
        <input type="hidden" name="calendarTimeZone" value={calendar.timeZone} />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="name" label="Name" required />
        <TextField name="email" label="Email" type="email" required />
      </div>

      {isPhoneEnabled() && (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="phone" label="Phone" type="tel" />
          <SelectField
            name="preferredContact"
            label="Preferred contact method"
            options={['Email', 'Phone']}
          />
        </div>
      )}

      {consultationTypes.length > 1 ? (
        <SelectField
          name="sessionType"
          label="Consultation type"
          options={consultationOptions}
          value={selectedConsultationLabel}
          onChange={(value) => {
            const nextIndex = consultationTypes.findIndex(
              (consultation) => formatSessionTypeOption(consultation) === value,
            );
            setSelectedConsultationIndex(nextIndex >= 0 ? nextIndex : 0);
          }}
        />
      ) : selectedConsultation ? (
        <input
          type="hidden"
          name="sessionType"
          value={formatSessionTypeOption(selectedConsultation)}
        />
      ) : null}

      {selectedConsultation && calendarActive ? (
        <AvailabilitySchedulingFields
          calendarActive={calendarActive}
          pickerEnabled={pickerEnabled}
          calendar={calendar}
          durationMinutes={selectedConsultation.durationMinutes}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          slots={slots}
          busy={busy}
          slotsState={slotsState}
          slotsError={slotsError}
          availabilityGeneratedAt={availabilityGeneratedAt}
        />
      ) : (
        <TextAreaField name="availability" label="Availability notes" rows={3} />
      )}

      {selectedConsultation && (
        <SelectField
          name="locationPreference"
          label="Location or mode"
          options={deliveryModeOptions}
          value={getSessionDeliveryModeLabel(selectedDeliveryMode)}
          onChange={(value) => {
            const mode = selectedConsultation.modes.find(
              (consultationMode) =>
                getSessionDeliveryModeLabel(consultationMode) === value,
            );
            if (mode) setSelectedDeliveryMode(mode);
          }}
        />
      )}

      <TextAreaField
        name="reason"
        label="What are you hoping for support with?"
        rows={5}
        required
      />

      <CaptchaField captcha={formSettings.captcha} />
      <p>Please do not put sensitive information in the message field. I will follow up with you via email or phone.</p>
      <p> If you are in a crisis, or need immediate assistance, please call 911 or go to the nearest emergency room.</p>
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
        disabled={calendarActive && (slotsState !== 'ready' || !selectedSlot)}
      >
        Request a Consultation
      </button>
    </form>
  );
}

function SessionForm({
  calendarActive,
  pickerEnabled,
  formSettings,
  onSubmit,
}: SessionFormProps) {
  const sessionConfig = siteConfig.forms.bookSession;
  const { calendar } = sessionConfig;
  const sessionTypes = getSessionTypesByKind('session');
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDeliveryMode, setSelectedDeliveryMode] =
    useState<SessionDeliveryMode>('virtual');

  const selectedSession = sessionTypes[selectedSessionIndex] ?? sessionTypes[0];
  const {
    slots,
    busy,
    generatedAt: availabilityGeneratedAt,
    state: slotsState,
    error: slotsError,
  } = useSessionAvailability(selectedSession.durationMinutes, calendarActive);

  useEffect(() => {
    setSelectedSlot('');
  }, [selectedSession.durationMinutes]);

  const deliveryModeOptions = useMemo(
    () => getSessionDeliveryModeOptions(selectedSession.modes),
    [selectedSession.modes],
  );

  useEffect(() => {
    const nextMode = selectedSession.modes[0] ?? 'virtual';
    setSelectedDeliveryMode(nextMode);
  }, [selectedSession.modes, selectedSession.label]);

  const sessionOptions = useMemo(
    () =>
      sessionTypes.map((session) => ({
        value: formatSessionTypeOption(session),
        label: formatSessionTypeOption(session),
      })),
    [sessionTypes],
  );
  const selectedSessionLabel = formatSessionTypeOption(selectedSession);

  return (
    <form
      action={formSettings.action || undefined}
      method="post"
      data-basin-form={formSettings.backend === 'usebasin' ? '' : undefined}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <input type="hidden" name="formKind" value="session" />
      <input
        type="hidden"
        name="formLabel"
        value={siteConfig.forms.bookSession.label}
      />
      <input type="hidden" name="_subject" value={getFormSubject('session')} />
      <input type="hidden" name="provider" value={formSettings.backend} />
      {calendarActive && (
        <input type="hidden" name="calendarTimeZone" value={siteConfig.forms.bookSession.calendar.timeZone} />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="name" label="Name" required />
        <TextField name="email" label="Email" type="email" required />
      </div>

      {isPhoneEnabled() && (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="phone" label="Phone" type="tel" />
          <SelectField
            name="preferredContact"
            label="Preferred contact method"
            options={['Email', 'Phone']}
          />
        </div>
      )}

      <SelectField
        name="sessionType"
        label="Session type"
        options={sessionOptions}
        value={selectedSessionLabel}
        onChange={(value) => {
          const nextIndex = sessionTypes.findIndex(
            (session) => formatSessionTypeOption(session) === value,
          );
          setSelectedSessionIndex(nextIndex >= 0 ? nextIndex : 0);
        }}
      />

      {calendarActive ? (
        <AvailabilitySchedulingFields
          calendarActive={calendarActive}
          pickerEnabled={pickerEnabled}
          calendar={calendar}
          durationMinutes={selectedSession.durationMinutes}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          slots={slots}
          busy={busy}
          slotsState={slotsState}
          slotsError={slotsError}
          availabilityGeneratedAt={availabilityGeneratedAt}
        />
      ) : (
        <TextField
          name="preferredDateTime"
          label="Preferred date/time"
          placeholder="Example: Tuesdays after 2 PM"
          required
        />
      )}

      <SelectField
        name="locationPreference"
        label="Location or mode"
        options={deliveryModeOptions}
        value={getSessionDeliveryModeLabel(selectedDeliveryMode)}
        onChange={(value) => {
          const mode = selectedSession.modes.find(
            (sessionMode) => getSessionDeliveryModeLabel(sessionMode) === value,
          );
          if (mode) setSelectedDeliveryMode(mode);
        }}
      />

      <TextAreaField
        name="notes"
        label="Short reason or notes"
        rows={5}
        required
      />

      <CaptchaField captcha={formSettings.captcha} />
      <p>Please do not put sensitive information in the message field. I will follow up with you via email or phone.</p>
      <p> If you are in a crisis, or need immediate assistance, please call 911 or go to the nearest emergency room.</p>
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-full px-6 py-3 font-bold shadow-sm transition-colors"
        disabled={calendarActive && (slotsState !== 'ready' || !selectedSlot)}
      >
        Request a Session
      </button>
    </form>
  );
}

type AvailabilitySchedulingFieldsProps = {
  calendarActive: boolean;
  pickerEnabled: boolean;
  calendar: (typeof siteConfig.forms.bookSession)['calendar'];
  durationMinutes: number;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  slots: AvailableSlot[];
  busy: BusyInterval[];
  slotsState: AvailabilityState;
  slotsError: string;
  availabilityGeneratedAt: string;
};

function AvailabilitySchedulingFields({
  calendarActive,
  pickerEnabled,
  calendar,
  durationMinutes,
  selectedSlot,
  onSlotChange,
  slots,
  busy,
  slotsState,
  slotsError,
  availabilityGeneratedAt,
}: AvailabilitySchedulingFieldsProps) {
  if (!calendarActive) {
    return null;
  }

  if (pickerEnabled) {
    return (
      <div className="space-y-2">
        <AvailabilityWeekPicker
          slots={slots}
          busy={busy}
          selectedStart={selectedSlot}
          onSelect={(slot) => onSlotChange(slot.start)}
          businessHours={calendar.businessHours}
          timeZone={calendar.timeZone}
          weekStartsOn={calendar.availabilityPicker.weekStartsOn}
          sessionDurationMinutes={durationMinutes}
          state={slotsState}
          error={slotsError}
          generatedAt={availabilityGeneratedAt}
        />
        <input
          type="hidden"
          name="preferredDateTime"
          value={slots.find((slot) => slot.start === selectedSlot)?.label ?? ''}
        />
        <input type="hidden" name="preferredDateTimeIso" value={selectedSlot} />
        <input
          type="hidden"
          name="sessionDurationMinutes"
          value={String(durationMinutes)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="space-y-2">
        <span className="text-foreground text-sm font-bold">Available time</span>
        <select
          required
          value={selectedSlot}
          onChange={(event) => onSlotChange(event.target.value)}
          disabled={slotsState !== 'ready' || slots.length === 0}
          className="border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-3 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {slotsState === 'loading'
              ? 'Loading available times...'
              : slots.length === 0
                ? 'No matching times available'
                : 'Select a time'}
          </option>
          {slots.map((slot) => (
            <option key={slot.start} value={slot.start}>
              {slot.label}
            </option>
          ))}
        </select>
      </label>
      <input
        type="hidden"
        name="preferredDateTime"
        value={slots.find((slot) => slot.start === selectedSlot)?.label ?? ''}
      />
      <input type="hidden" name="preferredDateTimeIso" value={selectedSlot} />
      <input
        type="hidden"
        name="sessionDurationMinutes"
        value={String(durationMinutes)}
      />
     
      {slotsState === 'loading' && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Checking the public calendar...
        </p>
      )}
      {slotsState === 'error' && (
        <p className="text-destructive text-sm leading-relaxed">{slotsError}</p>
      )}
    </div>
  );
}

function SessionAvailability() {
  const { calendar } = siteConfig.forms.bookSession;
  const embedSrc = getSessionCalendarEmbedUrl();

  return (
    <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm md:p-8">
      <div className="space-y-4">
        <div>
          <p className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
            Availability
          </p>
          <h2 className="font-heading text-foreground mt-2 text-3xl font-bold">
            Upcoming openings
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {calendar.availabilityHelpText}
        </p>
        {calendar.mode === 'serverless-google-api' && (
          <p className="text-muted-foreground rounded-2xl bg-secondary/30 p-4 text-sm leading-relaxed">
            Serverless Google API mode requires an authenticated backend before
            it can create organizer-owned events. Until that endpoint is added,
            this page still uses the public calendar and session request form.
          </p>
        )}
        {embedSrc && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Google Calendar availability"
              src={embedSrc}
              className="h-[32rem] w-full"
              loading="lazy"
            />
          </div>
        )}
        {calendar.publicCalendarUrl && (
          <a
            href={calendar.publicCalendarUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-2 font-bold"
          >
            Open public availability calendar
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

type SubmissionSuccessProps = {
  isSession: boolean;
  message: string;
  onReset: () => void;
};

function SubmissionSuccess({
  isSession,
  message,
  onReset,
}: SubmissionSuccessProps) {
  return (
    <div className="space-y-4 text-center">
      <CheckCircle className="text-primary mx-auto h-14 w-14" />
      <h2 className="font-heading text-foreground text-3xl font-bold">
        Thank you for reaching out.
      </h2>
      <p className="text-muted-foreground leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="border-primary text-primary hover:bg-primary/10 rounded-full border px-6 py-3 font-bold"
      >
        {isSession ? 'Send another session request' : 'Send another request'}
      </button>
    </div>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function TextField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
}: TextFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-foreground text-sm font-bold">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-3 outline-none transition-colors"
      />
    </label>
  );
}

type TextAreaFieldProps = {
  name: string;
  label: string;
  rows: number;
  required?: boolean;
};

function TextAreaField({ name, label, rows, required }: TextAreaFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-foreground text-sm font-bold">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        className="border-border bg-background focus:border-primary w-full resize-none rounded-xl border px-4 py-3 outline-none transition-colors"
      />
    </label>
  );
}

type SelectOption = string | { value: string; label: string };

type SelectFieldProps = {
  name: string;
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
};

function SelectField({
  name,
  label,
  options,
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-foreground text-sm font-bold">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="border-border bg-background focus:border-primary w-full rounded-xl border px-4 py-3 outline-none transition-colors"
      >
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}
