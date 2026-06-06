import {
  isExportFormat,
  isUserExportTargetType,
  type ExportFormat,
  type ExportTargetType,
} from "@/modules/import-export/application/export-targets";
import type { ExportFilters } from "@/modules/import-export/application/ports/import-export.repository";
import {
  SensitiveExportConfirmationRequiredError,
  ValidationError,
} from "@/modules/import-export/domain/import-export.errors";

export interface CreateExportJobCommand {
  readonly targetType: unknown;
  readonly format: unknown;
  readonly includeSensitiveData?: boolean;
  readonly sensitiveConfirm?: boolean;
  readonly filters?: unknown;
}

export interface NormalizedExportCommand {
  readonly targetType: ExportTargetType;
  readonly format: ExportFormat;
  readonly includeSensitiveData: boolean;
  readonly sensitiveWarningAccepted: boolean;
  readonly filters: ExportFilters | null;
}

export function normalizeCreateExportJobCommand(
  command: CreateExportJobCommand
): NormalizedExportCommand {
  const targetType = normalizeUserExportTargetType(command.targetType);
  const format = normalizeExportFormat(command.format);

  return normalizeExportCommand({
    targetType,
    format,
    includeSensitiveData: command.includeSensitiveData,
    sensitiveConfirm: command.sensitiveConfirm,
    filters: command.filters,
  });
}

export function normalizeScheduleWeekExportCommand(command: {
  readonly format?: unknown;
  readonly includeSensitiveData?: boolean;
  readonly sensitiveConfirm?: boolean;
  readonly from?: unknown;
  readonly to?: unknown;
}): NormalizedExportCommand {
  return normalizeExportCommand({
    targetType: "WEEKLY_SCHEDULE_REPORT",
    format: command.format ?? "EXCEL",
    includeSensitiveData: command.includeSensitiveData,
    sensitiveConfirm: command.sensitiveConfirm,
    filters: compactFilters({
      from: command.from,
      to: command.to,
    }),
  });
}

function normalizeExportCommand(command: {
  readonly targetType: ExportTargetType;
  readonly format: unknown;
  readonly includeSensitiveData?: boolean;
  readonly sensitiveConfirm?: boolean;
  readonly filters?: unknown;
}): NormalizedExportCommand {
  const format = normalizeExportFormat(command.format);
  const includeSensitiveData = command.includeSensitiveData === true;
  const sensitiveWarningAccepted = command.sensitiveConfirm === true;

  if (includeSensitiveData && !sensitiveWarningAccepted) {
    throw new SensitiveExportConfirmationRequiredError();
  }

  return {
    targetType: command.targetType,
    format,
    includeSensitiveData,
    sensitiveWarningAccepted,
    filters: normalizeFilters(command.filters),
  };
}

function normalizeUserExportTargetType(value: unknown): ExportTargetType {
  if (!isUserExportTargetType(value)) {
    throw new ValidationError("targetType must be a supported export target");
  }

  return value;
}

function normalizeExportFormat(value: unknown): ExportFormat {
  if (!isExportFormat(value)) {
    throw new ValidationError("format must be PDF or EXCEL");
  }

  return value;
}

function normalizeFilters(value: unknown): ExportFilters | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    throw new ValidationError("filters must be an object");
  }

  return compactFilters(value);
}

function compactFilters(value: Record<string, unknown>): ExportFilters | null {
  const entries = Object.entries(value).filter(([, item]) => {
    if (item === null || item === undefined) {
      return false;
    }

    return typeof item !== "string" || item.trim().length > 0;
  });

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
