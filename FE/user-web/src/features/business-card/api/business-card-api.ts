import type {
  BusinessCardConfirmResponse,
  BusinessCardScanDetail,
  BusinessCardScanResponse,
  ConfirmBusinessCardScanInput,
  ScanBusinessCardInput,
} from "@/features/business-card/types/business-card";
import { apiClient } from "@/lib/api-client";

export function scanBusinessCard(input: ScanBusinessCardInput) {
  const formData = new FormData();
  formData.append("imageFile", input.imageFile);

  if (input.memo?.trim()) {
    formData.append("memo", input.memo.trim());
  }

  return apiClient<BusinessCardScanResponse>("/api/business-cards/scan", {
    method: "POST",
    body: formData,
  });
}

export function getBusinessCardScan(scanId: string) {
  return apiClient<BusinessCardScanDetail>(`/api/business-cards/${scanId}`);
}

export function confirmBusinessCardScan(input: ConfirmBusinessCardScanInput) {
  return apiClient<BusinessCardConfirmResponse>(
    `/api/business-cards/${input.scanId}/confirm`,
    {
      method: "POST",
      body: compactBody({
        companyMode: input.companyMode,
        companyId: input.companyId,
        companyName: input.companyName,
        contactName: input.contactName,
        department: input.department,
        position: input.position,
        phone: input.phone,
        email: input.email,
        address: input.address,
      }),
    }
  );
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
