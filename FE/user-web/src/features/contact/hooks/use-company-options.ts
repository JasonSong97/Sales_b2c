import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company";

export function useCompanyOptions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: normalizedSearch.length > 0,
    queryKey: ["contact", "company-options", normalizedSearch],
    queryFn: () =>
      listCompanies({
        page: 1,
        companyName: normalizedSearch,
      }),
  });
}
