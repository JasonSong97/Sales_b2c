import { useQuery } from "@tanstack/react-query";
import {
  getDeal,
  listDealActivities,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type { DealActivityListParams } from "@/features/deal/types/deal";

export function useDealDetail(dealId: string) {
  return useQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.detail(dealId),
    queryFn: () => getDeal(dealId),
  });
}

export function useDealActivities(
  dealId: string,
  params: DealActivityListParams = {}
) {
  return useQuery({
    enabled: dealId.length > 0,
    queryKey: dealQueryKeys.activities(dealId, params),
    queryFn: () => listDealActivities(dealId, params),
  });
}
