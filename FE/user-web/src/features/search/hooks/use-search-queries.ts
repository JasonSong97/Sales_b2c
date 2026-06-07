import { useQuery } from "@tanstack/react-query";
import { searchAll } from "@/features/search/api/search-api";
import { searchQueryKeys } from "@/features/search/api/search-query-keys";
import type { SearchAllInput } from "@/features/search/types/search";

export function useSearchAll(input: SearchAllInput, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: searchQueryKeys.result(input),
    queryFn: () => searchAll(input),
  });
}
