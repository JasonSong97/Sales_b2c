import { IsBoolean, IsIn, IsObject, IsOptional, IsString } from "class-validator";
import {
  exportFormats,
  userExportTargetTypes,
  type ExportFormat,
  type ExportTargetType,
} from "@/modules/import-export/application/export-targets";

export class CreateExportJobDto {
  @IsIn(userExportTargetTypes)
  targetType!: Exclude<ExportTargetType, "WEEKLY_SCHEDULE_REPORT">;

  @IsIn(exportFormats)
  format!: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeSensitiveData?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitiveConfirm?: boolean;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}

export class CreateScheduleWeekExportDto {
  @IsOptional()
  @IsIn(exportFormats)
  format?: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeSensitiveData?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitiveConfirm?: boolean;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
