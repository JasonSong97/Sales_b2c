import type { ExtractedBusinessCardFields } from "./business-card-ocr.port";

export type {
  DeleteResultRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export const BUSINESS_CARD_REPOSITORY = Symbol("BUSINESS_CARD_REPOSITORY");

export type BusinessCardScanStatus =
  | "UPLOADED"
  | "OCR_PROCESSING"
  | "OCR_COMPLETED"
  | "CONFIRMED"
  | "FAILED";

export type BusinessCardCompanyMode = "EXISTING" | "NEW" | "NONE";

export interface StoredBusinessCardImage {
  readonly bucket: string;
  readonly objectKey: string;
  readonly contentType: string | null;
  readonly sizeBytes: number | null;
}

export interface BusinessCardScanRecord {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly status: BusinessCardScanStatus;
  readonly image: StoredBusinessCardImage;
  readonly extracted: ExtractedBusinessCardFields;
  readonly confirmedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface BusinessCardCompanyRecord {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly address: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface BusinessCardContactRecord {
  readonly id: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface BusinessCardCompanyCandidateRecord {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
}

export interface BusinessCardScanDetailRecord {
  readonly scan: BusinessCardScanRecord;
  readonly companyCandidates: BusinessCardCompanyCandidateRecord[];
  readonly errorMessage: string | null;
}

export interface BusinessCardConfirmRecord {
  readonly company: BusinessCardCompanyRecord | null;
  readonly contact: BusinessCardContactRecord;
}

export interface CreateBusinessCardScanInput {
  readonly userId: string;
  readonly image: StoredBusinessCardImage;
}

export interface CreateBusinessCardAiJobInput {
  readonly userId: string;
  readonly scanId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly memo: string | null;
}

export interface CompleteBusinessCardOcrInput {
  readonly userId: string;
  readonly scanId: string;
  readonly aiJobId: string;
  readonly extracted: ExtractedBusinessCardFields;
  readonly rawOutput: Record<string, unknown>;
}

export interface FailBusinessCardOcrInput {
  readonly userId: string;
  readonly scanId: string;
  readonly aiJobId: string;
  readonly errorMessage: string;
}

export interface ConfirmBusinessCardScanInput {
  readonly userId: string;
  readonly scanId: string;
  readonly companyMode: BusinessCardCompanyMode;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactName: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
}

export interface BusinessCardRepository {
  createScan(input: CreateBusinessCardScanInput): Promise<BusinessCardScanRecord>;
  createAiJob(input: CreateBusinessCardAiJobInput): Promise<{ readonly id: string }>;
  completeOcr(input: CompleteBusinessCardOcrInput): Promise<BusinessCardScanRecord>;
  failOcr(input: FailBusinessCardOcrInput): Promise<void>;
  getScanDetail(
    userId: string,
    scanId: string
  ): Promise<BusinessCardScanDetailRecord | null>;
  confirmScan(input: ConfirmBusinessCardScanInput): Promise<BusinessCardConfirmRecord>;
}
