export type BusinessCardScanStatus =
  | "UPLOADED"
  | "OCR_PROCESSING"
  | "OCR_COMPLETED"
  | "CONFIRMED"
  | "FAILED";

export type BusinessCardCompanyMode = "EXISTING" | "NEW" | "NONE";

export type ExtractedBusinessCardFields = {
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
};

export type BusinessCardScanResponse = {
  readonly scanId: string;
  readonly status: BusinessCardScanStatus;
  readonly createdAt: string;
};

export type BusinessCardCompanyCandidate = {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
};

export type BusinessCardScanDetail = {
  readonly scanId: string;
  readonly status: BusinessCardScanStatus;
  readonly extracted: ExtractedBusinessCardFields;
  readonly companyCandidates: BusinessCardCompanyCandidate[];
  readonly errorMessage: string | null;
};

export type BusinessCardCompany = {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly address: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type BusinessCardContact = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type BusinessCardConfirmResponse = {
  readonly company: BusinessCardCompany | null;
  readonly contact: BusinessCardContact;
};

export type ScanBusinessCardInput = {
  readonly imageFile: File;
  readonly memo?: string;
};

export type ConfirmBusinessCardScanInput = {
  readonly scanId: string;
  readonly companyMode: BusinessCardCompanyMode;
  readonly companyId?: string;
  readonly companyName?: string;
  readonly contactName: string;
  readonly department?: string;
  readonly position?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
};
