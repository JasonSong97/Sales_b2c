import { MeetingNoteNotFoundError } from "@/modules/meeting-note/domain/meeting-note.errors";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";

export function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string, label = "Text"): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError(`${label} is required`);
  }

  return trimmed;
}

export function normalizeRawText(value: string): string {
  const rawText = normalizeRequiredText(value, "rawText");

  if (rawText.length > 50_000) {
    throw new ValidationDomainError("rawText is too long");
  }

  return rawText;
}

export function normalizeOptionalId(value: string | null | undefined): string | null {
  return normalizeOptionalText(value);
}

export function normalizeRequiredId(value: string): string {
  return normalizeRequiredText(value, "id");
}

export function normalizeOptionalDate(
  value: string | null | undefined
): Date | null {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationDomainError("Invalid date");
  }

  return date;
}

export function normalizeRequiredDate(value: string, label = "date"): Date {
  const date = normalizeOptionalDate(value);

  if (!date) {
    throw new ValidationDomainError(`${label} is required`);
  }

  return date;
}

export function normalizePagination(input: {
  readonly page?: number;
  readonly pageSize?: number;
}): { page: number; pageSize: number } {
  const page = input.page && input.page > 0 ? input.page : 1;
  const pageSize =
    input.pageSize && input.pageSize > 0
      ? Math.min(input.pageSize, 100)
      : 20;

  return { page, pageSize };
}

export function assertMeetingNoteExists<TMeetingNote>(
  meetingNote: TMeetingNote | null
): TMeetingNote {
  if (!meetingNote) {
    throw new MeetingNoteNotFoundError();
  }

  return meetingNote;
}

export function assertNotDeleted(
  deletedAt: Date | null,
  operation: "read" | "write"
): void {
  if (deletedAt) {
    throw new DeletedResourceError(operation);
  }
}
