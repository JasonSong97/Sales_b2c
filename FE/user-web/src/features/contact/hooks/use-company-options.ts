import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/features/company";

export function useCompanyOptions(search: string) {
  return useQuery({
    queryKey: ["contact", "company-options", search],
    queryFn: () =>
      listCompanies({
        page: 1,
        pageSize: 10,
        search: search.trim() || undefined,
      }),
  });
}
