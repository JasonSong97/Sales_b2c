export const exportTargetTypes = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "WEEKLY_SCHEDULE_REPORT",
] as const;

export type ExportTargetType = (typeof exportTargetTypes)[number];

export const userExportTargetTypes = exportTargetTypes.filter(
  (targetType) => targetType !== "WEEKLY_SCHEDULE_REPORT"
) as readonly Exclude<ExportTargetType, "WEEKLY_SCHEDULE_REPORT">[];

export const exportFormats = ["PDF", "EXCEL"] as const;

export type ExportFormat = (typeof exportFormats)[number];

export function isExportTargetType(value: unknown): value is ExportTargetType {
  return (
    typeof value === "string" &&
    exportTargetTypes.includes(value as ExportTargetType)
  );
}

export function isUserExportTargetType(
  value: unknown
): value is Exclude<ExportTargetType, "WEEKLY_SCHEDULE_REPORT"> {
  return (
    typeof value === "string" &&
    userExportTargetTypes.includes(
      value as Exclude<ExportTargetType, "WEEKLY_SCHEDULE_REPORT">
    )
  );
}

export function isExportFormat(value: unknown): value is ExportFormat {
  return typeof value === "string" && exportFormats.includes(value as ExportFormat);
}
