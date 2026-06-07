import type {
  SearchAllInput,
  SearchAllResponse,
} from "@/features/search/types/search";
import { apiClient } from "@/lib/api-client";

export function searchAll(input: SearchAllInput) {
  const searchParams = new URLSearchParams();

  searchParams.set("q", input.q);

  if (input.types && input.types.length > 0) {
    searchParams.set("types", input.types.join(","));
  }

  if (input.limit !== undefined) {
    searchParams.set("limit", String(input.limit));
  }

  return apiClient<SearchAllResponse>(`/api/search?${searchParams.toString()}`);
}
