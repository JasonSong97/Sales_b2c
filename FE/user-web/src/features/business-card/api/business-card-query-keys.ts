export const businessCardQueryKeys = {
  all: ["business-card"] as const,
  details: () => [...businessCardQueryKeys.all, "detail"] as const,
  detail: (scanId: string) => [...businessCardQueryKeys.details(), scanId] as const,
};
