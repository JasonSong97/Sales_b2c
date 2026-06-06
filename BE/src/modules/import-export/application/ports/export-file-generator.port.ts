import type {
  ExportFormat,
  ExportTargetType,
} from "@/modules/import-export/application/export-targets";

export const EXPORT_FILE_GENERATOR_PORT = Symbol("EXPORT_FILE_GENERATOR_PORT");

export type ExportCellValue = string | number | boolean | null;

export interface ExportDataTable {
  readonly targetType: ExportTargetType;
  readonly headers: string[];
  readonly rows: readonly ExportCellValue[][];
}

export interface GeneratedExportFile {
  readonly fileName: string;
  readonly contentType: string;
  readonly buffer: Buffer;
}

export interface GenerateExportFileInput {
  readonly format: ExportFormat;
  readonly data: ExportDataTable;
}

export interface ExportFileGeneratorPort {
  generate(input: GenerateExportFileInput): Promise<GeneratedExportFile>;
}
