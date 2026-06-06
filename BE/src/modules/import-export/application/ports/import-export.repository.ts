import type { ImportTargetType } from "@/modules/import-export/application/import-target-fields";
import type {
  ExportFormat,
  ExportTargetType,
} from "@/modules/import-export/application/export-targets";
import type { ExportDataTable } from "@/modules/import-export/application/ports/export-file-generator.port";
import type {
  ImportMapping,
  ImportMappingSuggestion,
} from "@/modules/import-export/application/ports/import-mapping.port";
import type { StoredObject } from "@/shared/application/ports/storage.port";

export const IMPORT_EXPORT_REPOSITORY = Symbol("IMPORT_EXPORT_REPOSITORY");

export type ImportJobStatus =
  | "UPLOADED"
  | "PREVIEW_READY"
  | "MAPPING_PENDING"
  | "MAPPING_READY"
  | "VALIDATION_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type ImportRowStatus =
  | "PENDING"
  | "VALID"
  | "VALIDATION_FAILED"
  | "IMPORTED"
  | "SKIPPED"
  | "FAILED";

export type ImportFieldValue = string | number | null;
export type ImportRawRowData = Record<string, string>;
export type ImportMappedRowData = Record<string, ImportFieldValue>;
export type ExportFilters = Record<string, unknown>;

export type ExportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface ImportErrorRecord {
  readonly rowNumber: number | null;
  readonly message: string;
}

export interface ImportResultSummary {
  readonly sourceColumns?: string[];
  readonly successCount?: number;
  readonly failedCount?: number;
  readonly errors?: ImportErrorRecord[];
}

export interface ImportJobRecord {
  readonly id: string;
  readonly userId: string;
  readonly targetType: ImportTargetType;
  readonly fileName: string;
  readonly file: StoredObject | null;
  readonly status: ImportJobStatus;
  readonly aiMapping: ImportMappingSuggestion | null;
  readonly userMapping: ImportMapping | null;
  readonly resultSummary: ImportResultSummary | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly completedAt: Date | null;
}

export interface ImportJobRowRecord {
  readonly id: string;
  readonly importJobId: string;
  readonly rowNumber: number;
  readonly rawData: ImportRawRowData;
  readonly mappedData: ImportMappedRowData | null;
  readonly status: ImportRowStatus;
  readonly errorMessage: string | null;
  readonly targetId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ImportJobDetailRecord {
  readonly job: ImportJobRecord;
  readonly rows: ImportJobRowRecord[];
}

export interface CreateImportJobRowInput {
  readonly rowNumber: number;
  readonly rawData: ImportRawRowData;
}

export interface CreateImportJobInput {
  readonly userId: string;
  readonly targetType: ImportTargetType;
  readonly fileName: string;
  readonly file: StoredObject;
  readonly sourceColumns: string[];
  readonly rows: CreateImportJobRowInput[];
}

export interface CreateImportAiJobInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly targetType: ImportTargetType;
  readonly sourceColumns: string[];
  readonly rowCount: number;
}

export interface CompleteImportAiMappingInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly aiJobId: string;
  readonly suggestion: ImportMappingSuggestion;
}

export interface FailImportAiMappingInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly aiJobId: string;
  readonly errorMessage: string;
}

export interface UpdateImportMappingRowInput {
  readonly rowId: string;
  readonly mappedData: ImportMappedRowData;
  readonly status: Extract<ImportRowStatus, "VALID" | "VALIDATION_FAILED">;
  readonly errorMessage: string | null;
}

export interface UpdateImportMappingInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly mapping: ImportMapping;
  readonly status: Extract<ImportJobStatus, "MAPPING_READY" | "VALIDATION_FAILED">;
  readonly rows: UpdateImportMappingRowInput[];
}

export interface ConfirmImportJobInput {
  readonly userId: string;
  readonly importJobId: string;
}

export interface ImportJobResultRecord {
  readonly id: string;
  readonly status: ImportJobStatus;
  readonly successCount: number;
  readonly failedCount: number;
  readonly errors: ImportErrorRecord[];
}

export interface ExportJobRecord {
  readonly id: string;
  readonly userId: string;
  readonly targetType: ExportTargetType;
  readonly format: ExportFormat;
  readonly status: ExportJobStatus;
  readonly includeSensitiveData: boolean;
  readonly sensitiveWarningAccepted: boolean;
  readonly file: StoredObject | null;
  readonly filter: ExportFilters | null;
  readonly resultSummary: Record<string, unknown> | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly completedAt: Date | null;
  readonly expiresAt: Date | null;
}

export interface CreateExportJobInput {
  readonly userId: string;
  readonly targetType: ExportTargetType;
  readonly format: ExportFormat;
  readonly includeSensitiveData: boolean;
  readonly sensitiveWarningAccepted: boolean;
  readonly filters: ExportFilters | null;
}

export interface ListExportDataInput {
  readonly userId: string;
  readonly targetType: ExportTargetType;
  readonly includeSensitiveData: boolean;
  readonly filters: ExportFilters | null;
}

export interface CompleteExportJobInput {
  readonly userId: string;
  readonly exportJobId: string;
  readonly file: StoredObject;
  readonly rowCount: number;
  readonly expiresAt: Date;
}

export interface FailExportJobInput {
  readonly userId: string;
  readonly exportJobId: string;
  readonly errorMessage: string;
}

export interface ImportExportRepository {
  createJob(input: CreateImportJobInput): Promise<ImportJobDetailRecord>;
  getJobDetail(
    userId: string,
    importJobId: string
  ): Promise<ImportJobDetailRecord | null>;
  createAiJob(input: CreateImportAiJobInput): Promise<{ readonly id: string }>;
  completeAiMapping(input: CompleteImportAiMappingInput): Promise<void>;
  failAiMapping(input: FailImportAiMappingInput): Promise<void>;
  updateMapping(input: UpdateImportMappingInput): Promise<ImportJobDetailRecord>;
  confirmJob(input: ConfirmImportJobInput): Promise<ImportJobResultRecord>;
  createExportJob(input: CreateExportJobInput): Promise<ExportJobRecord>;
  listExportData(input: ListExportDataInput): Promise<ExportDataTable>;
  completeExportJob(input: CompleteExportJobInput): Promise<ExportJobRecord>;
  failExportJob(input: FailExportJobInput): Promise<void>;
  getExportJob(
    userId: string,
    exportJobId: string
  ): Promise<ExportJobRecord | null>;
}
