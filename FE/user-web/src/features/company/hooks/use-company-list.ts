import { useQuery } from "@tanstack/react-query";
import {
  listCompanies,
  listCompanyFields,
  listCompanyRegions,
} from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";
import type { CompanyListParams } from "@/features/company/types/company";

// 기능 : 회사 목록을 필터와 페이지 기준으로 조회합니다.
export function useCompanyList(params: CompanyListParams) {
  return useQuery({
    queryKey: companyQueryKeys.list(params),
    queryFn: () => listCompanies(params),
  });
}

// 기능 : 회사 분야 선택지를 조회합니다.
export function useCompanyFields() {
  return useQuery({
    queryKey: companyQueryKeys.fields(),
    queryFn: listCompanyFields,
  });
}

// 기능 : 회사 지역 선택지를 조회합니다.
export function useCompanyRegions() {
  return useQuery({
    queryKey: companyQueryKeys.regions(),
    queryFn: listCompanyRegions,
  });
}
