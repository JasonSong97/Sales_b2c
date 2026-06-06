export const BUSINESS_CARD_OCR_PORT = Symbol("BUSINESS_CARD_OCR_PORT");

export interface ExtractedBusinessCardFields {
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
}

export interface BusinessCardOcrInput {
  readonly image: {
    readonly buffer: Buffer;
    readonly contentType: string;
    readonly fileName: string;
  };
}

export interface BusinessCardOcrResult {
  readonly extracted: ExtractedBusinessCardFields;
  readonly rawOutput: Record<string, unknown>;
}

export interface BusinessCardOcrPort {
  extractBusinessCard(input: BusinessCardOcrInput): Promise<BusinessCardOcrResult>;
}
