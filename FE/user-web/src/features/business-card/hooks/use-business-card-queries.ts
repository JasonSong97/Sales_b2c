import { useQuery } from "@tanstack/react-query";
import { getBusinessCardScan } from "@/features/business-card/api/business-card-api";
import { businessCardQueryKeys } from "@/features/business-card/api/business-card-query-keys";

export function useBusinessCardScanDetail(scanId: string) {
  return useQuery({
    enabled: scanId.length > 0,
    queryKey: businessCardQueryKeys.detail(scanId),
    queryFn: () => getBusinessCardScan(scanId),
  });
}
