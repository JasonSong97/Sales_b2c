import type { SearchAllInput } from "@/features/search/types/search";

export const searchQueryKeys = {
  all: ["search"] as const,
  results: () => [...searchQueryKeys.all, "results"] as const,
  result: (input: SearchAllInput) =>
    [
      ...searchQueryKeys.results(),
      {
        q: input.q,
        types: input.types?.join(",") ?? "",
        limit: input.limit ?? 5,
      },
    ] as const,
};
