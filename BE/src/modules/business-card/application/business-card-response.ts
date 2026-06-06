import type {
  BusinessCardCompanyCandidateRecord,
  BusinessCardCompanyRecord,
  BusinessCardConfirmRecord,
  BusinessCardContactRecord,
  BusinessCardScanDetailRecord,
  BusinessCardScanRecord,
  BusinessCardScanStatus,
} from "@/modules/business-card/application/ports/business-card.repository";
import type { ExtractedBusinessCardFields } from "./ports/business-card-ocr.port";

export interface BusinessCardScanResponse {
  readonly scanId: string;
  readonly status: BusinessCardScanStatus;
  readonly createdAt: string;
}

export interface BusinessCardCompanyCandidateResponse {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
}

export interface BusinessCardScanDetailResponse {
  readonly scanId: string;
  readonly status: BusinessCardScanStatus;
  readonly extracted: ExtractedBusinessCardFields;
  readonly companyCandidates: BusinessCardCompanyCandidateResponse[];
  readonly errorMessage: string | null;
}

export interface BusinessCardCompanyResponse {
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
}

export interface BusinessCardContactResponse {
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
}

export interface BusinessCardConfirmResponse {
  readonly company: BusinessCardCompanyResponse | null;
  readonly contact: BusinessCardContactResponse;
}

export function toBusinessCardScanResponse(
  scan: BusinessCardScanRecord
): BusinessCardScanResponse {
  return {
    scanId: scan.id,
    status: scan.status,
    createdAt: scan.createdAt.toISOString(),
  };
}

export function toBusinessCardScanDetailResponse(
  detail: BusinessCardScanDetailRecord
): BusinessCardScanDetailResponse {
  return {
    scanId: detail.scan.id,
    status: detail.scan.status,
    extracted: detail.scan.extracted,
    companyCandidates: detail.companyCandidates.map(toCompanyCandidateResponse),
    errorMessage: detail.errorMessage,
  };
}

export function toBusinessCardConfirmResponse(
  result: BusinessCardConfirmRecord
): BusinessCardConfirmResponse {
  return {
    company: result.company ? toCompanyResponse(result.company) : null,
    contact: toContactResponse(result.contact),
  };
}

function toCompanyCandidateResponse(
  company: BusinessCardCompanyCandidateRecord
): BusinessCardCompanyCandidateResponse {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    region: company.region,
  };
}

function toCompanyResponse(
  company: BusinessCardCompanyRecord
): BusinessCardCompanyResponse {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    region: company.region,
    address: company.address,
    website: company.website,
    description: company.description,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(company.deletedAt),
    permanentDeleteAt: toIsoOrNull(company.permanentDeleteAt),
  };
}

function toContactResponse(
  contact: BusinessCardContactRecord
): BusinessCardContactResponse {
  return {
    id: contact.id,
    name: contact.name,
    companyId: contact.companyId,
    companyName: contact.companyName,
    department: contact.department,
    position: contact.position,
    phone: contact.phone,
    email: contact.email,
    address: contact.address,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(contact.deletedAt),
    permanentDeleteAt: toIsoOrNull(contact.permanentDeleteAt),
  };
}

function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
