import type { ScheduleSource } from "@/modules/schedule/application/ports/schedule.repository";
import {
  InvalidScheduleRangeError,
  ScheduleNotFoundError,
} from "@/modules/schedule/domain/schedule.errors";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";

const DEFAULT_TIMEZONE = "Asia/Seoul";
const SCHEDULE_SOURCES: ScheduleSource[] = ["INTERNAL", "GOOGLE"];

export interface ScheduleRange {
  readonly rangeStart: Date;
  readonly rangeEnd: Date;
  readonly timezone: string;
}

export function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError("Required text field is empty");
  }

  return trimmed;
}

export function normalizeOptionalId(value: string | null | undefined): string | null {
  return normalizeOptionalText(value);
}

export function normalizeRequiredDate(value: string): Date {
  return parseDate(value);
}

export function normalizeOptionalDate(
  value: string | null | undefined
): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value.trim().length === 0) {
    return undefined;
  }

  return parseDate(value);
}

export function normalizeAllDay(value: boolean | null | undefined): boolean {
  return value ?? false;
}

export function normalizeOptionalAllDay(
  value: boolean | null | undefined
): boolean | undefined {
  return value === null ? undefined : value;
}

export function normalizeReminderMinutes(
  values: readonly number[] | null | undefined
): number[] {
  const uniqueMinutes = new Set<number>();

  for (const value of values ?? []) {
    if (!Number.isInteger(value) || value < 0 || value > 60 * 24 * 30) {
      throw new ValidationDomainError("Invalid reminder minutes");
    }

    uniqueMinutes.add(value);
  }

  return Array.from(uniqueMinutes).sort((left, right) => left - right);
}

export function normalizeOptionalReminderMinutes(
  values: readonly number[] | null | undefined
): number[] | undefined {
  return values === undefined ? undefined : normalizeReminderMinutes(values ?? []);
}

export function normalizeScheduleSource(
  value: string | null | undefined
): ScheduleSource | null {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  if (SCHEDULE_SOURCES.includes(normalized as ScheduleSource)) {
    return normalized as ScheduleSource;
  }

  throw new ValidationDomainError("Invalid schedule source");
}

export function normalizeTimezone(value: string | null | undefined): string {
  const timezone = normalizeOptionalText(value) ?? DEFAULT_TIMEZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new ValidationDomainError("Invalid timezone");
  }

  return timezone;
}

export function normalizeScheduleRange(input: {
  readonly from?: string;
  readonly to?: string;
  readonly timezone?: string;
  readonly now?: Date;
}): ScheduleRange {
  const timezone = normalizeTimezone(input.timezone);
  const hasFrom = normalizeOptionalText(input.from) !== null;
  const hasTo = normalizeOptionalText(input.to) !== null;

  if (hasFrom || hasTo) {
    if (!input.from || !input.to) {
      throw new InvalidScheduleRangeError();
    }

    const rangeStart = parseDateBoundary(input.from, timezone);
    const rangeEnd = parseDateBoundary(input.to, timezone);
    assertValidRange(rangeStart, rangeEnd);

    return { rangeStart, rangeEnd, timezone };
  }

  return getCurrentMonthRange(timezone, input.now ?? new Date());
}

export function normalizeExplicitRange(input: {
  readonly from: string;
  readonly to: string;
  readonly timezone?: string;
}): ScheduleRange {
  const timezone = normalizeTimezone(input.timezone);
  const rangeStart = parseDateBoundary(input.from, timezone);
  const rangeEnd = parseDateBoundary(input.to, timezone);
  assertValidRange(rangeStart, rangeEnd);

  return { rangeStart, rangeEnd, timezone };
}

export function normalizeWeeklyRange(input: {
  readonly weekStart: string;
  readonly timezone?: string;
}): ScheduleRange {
  const timezone = normalizeTimezone(input.timezone);
  const rangeStart = parseDateBoundary(input.weekStart, timezone);
  const rangeEnd = addDays(rangeStart, 7);
  assertValidRange(rangeStart, rangeEnd);

  return { rangeStart, rangeEnd, timezone };
}

export function assertValidRange(startAt: Date, endAt: Date): void {
  if (startAt.getTime() >= endAt.getTime()) {
    throw new InvalidScheduleRangeError();
  }
}

export function assertScheduleExists<TSchedule>(
  schedule: TSchedule | null
): TSchedule {
  if (!schedule) {
    throw new ScheduleNotFoundError();
  }

  return schedule;
}

export function assertNotDeleted(
  deletedAt: Date | null,
  operation: "read" | "write"
): void {
  if (deletedAt) {
    throw new DeletedResourceError(operation);
  }
}

export function getLocalDateKey(date: Date, timezone: string): string {
  const parts = getZonedParts(date, timezone);

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getCurrentMonthRange(timezone: string, now: Date): ScheduleRange {
  const parts = getZonedParts(now, timezone);
  const rangeStart = zonedTimeToUtc(parts.year, parts.month, 1, 0, 0, 0, timezone);
  const nextMonth = parts.month === 12 ? 1 : parts.month + 1;
  const nextMonthYear = parts.month === 12 ? parts.year + 1 : parts.year;
  const rangeEnd = zonedTimeToUtc(nextMonthYear, nextMonth, 1, 0, 0, 0, timezone);

  return { rangeStart, rangeEnd, timezone };
}

function parseDate(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationDomainError("Invalid date");
  }

  return date;
}

function parseDateBoundary(value: string, timezone: string): Date {
  const trimmed = value.trim();
  const dateOnlyMatch = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(trimmed);

  if (dateOnlyMatch) {
    return zonedTimeToUtc(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]),
      Number(dateOnlyMatch[3]),
      0,
      0,
      0,
      timezone
    );
  }

  return parseDate(trimmed);
}

function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone: string
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timezone);

  return new Date(utcGuess.getTime() - offsetMs);
}

function getTimeZoneOffsetMs(date: Date, timezone: string): number {
  const parts = getZonedParts(date, timezone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return asUtc - date.getTime();
}

function getZonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: values.year ?? 1970,
    month: values.month ?? 1,
    day: values.day ?? 1,
    hour: values.hour ?? 0,
    minute: values.minute ?? 0,
    second: values.second ?? 0,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
