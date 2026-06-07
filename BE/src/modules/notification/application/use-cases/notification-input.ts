import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { NotificationReadFilter } from "../ports/notification.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_REMINDER_MINUTES = 10080;

export function normalizePage(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_PAGE;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationDomainError("Page must be a positive integer");
  }

  return value;
}

export function normalizePageSize(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  if (!Number.isInteger(value) || value < 1 || value > MAX_PAGE_SIZE) {
    throw new ValidationDomainError("Page size must be between 1 and 100");
  }

  return value;
}

export function normalizeNotificationReadFilter(
  value: string | undefined
): NotificationReadFilter {
  if (!value || value === "ALL") {
    return "ALL";
  }

  if (value === "READ" || value === "UNREAD") {
    return value;
  }

  throw new ValidationDomainError("Invalid notification status filter");
}

export function normalizeDefaultReminderMinutes(
  value: number | undefined
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_REMINDER_MINUTES
  ) {
    throw new ValidationDomainError(
      "Default reminder minutes must be between 0 and 10080"
    );
  }

  return value;
}

export function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string, fieldName: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError(`${fieldName} is required`);
  }

  return trimmed;
}
