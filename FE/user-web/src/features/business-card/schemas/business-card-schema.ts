import { z } from "zod";
import type {
  BusinessCardCompanyMode,
  BusinessCardScanDetail,
  ConfirmBusinessCardScanInput,
} from "@/features/business-card/types/business-card";

export const BUSINESS_CARD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const businessCardConfirmSchema = z
  .object({
    companyMode: z.enum(["EXISTING", "NEW", "NONE"]),
    companyId: z.string().optional(),
    companyName: z.string().max(160).optional(),
    contactName: z.string().trim().min(1, "담당자 이름을 입력해주세요.").max(120),
    department: z.string().max(120).optional(),
    position: z.string().max(120).optional(),
    phone: z.string().max(80).optional(),
    email: z.string().max(160).optional(),
    address: z.string().max(240).optional(),
  })
  .superRefine((values, context) => {
    if (values.companyMode === "EXISTING" && !values.companyId?.trim()) {
      context.addIssue({
        code: "custom",
        message: "기존 회사를 선택해주세요.",
        path: ["companyId"],
      });
    }

    if (values.companyMode === "NEW" && !values.companyName?.trim()) {
      context.addIssue({
        code: "custom",
        message: "새 회사명을 입력해주세요.",
        path: ["companyName"],
      });
    }
  });

export type BusinessCardConfirmFormValues = z.infer<
  typeof businessCardConfirmSchema
>;

export const emptyBusinessCardConfirmFormValues: BusinessCardConfirmFormValues = {
  companyMode: "NEW",
  companyId: "",
  companyName: "",
  contactName: "",
  department: "",
  position: "",
  phone: "",
  email: "",
  address: "",
};

export function validateBusinessCardImage(file: File | null): string | null {
  if (!file) {
    return "명함 이미지 파일을 선택해주세요.";
  }

  if (!allowedMimeTypes.has(file.type)) {
    return "JPG, PNG, WebP 이미지만 업로드할 수 있습니다.";
  }

  if (file.size > BUSINESS_CARD_MAX_FILE_SIZE_BYTES) {
    return "이미지 용량은 10MB 이하여야 합니다.";
  }

  return null;
}

export function toConfirmFormValues(
  detail: BusinessCardScanDetail,
  companyMode: BusinessCardCompanyMode
): BusinessCardConfirmFormValues {
  const candidate = detail.companyCandidates[0];

  return {
    companyMode,
    companyId: companyMode === "EXISTING" ? candidate?.id ?? "" : "",
    companyName: detail.extracted.companyName ?? "",
    contactName: detail.extracted.contactName ?? "",
    department: detail.extracted.department ?? "",
    position: detail.extracted.position ?? "",
    phone: detail.extracted.phone ?? "",
    email: detail.extracted.email ?? "",
    address: detail.extracted.address ?? "",
  };
}

export function toConfirmInput(
  scanId: string,
  values: BusinessCardConfirmFormValues
): ConfirmBusinessCardScanInput {
  return {
    scanId,
    companyMode: values.companyMode,
    companyId:
      values.companyMode === "EXISTING" ? toOptionalText(values.companyId) : undefined,
    companyName:
      values.companyMode === "NEW" ? toOptionalText(values.companyName) : undefined,
    contactName: values.contactName.trim(),
    department: toOptionalText(values.department),
    position: toOptionalText(values.position),
    phone: toOptionalText(values.phone),
    email: toOptionalText(values.email),
    address: toOptionalText(values.address),
  };
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}
