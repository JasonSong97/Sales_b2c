import type {
  ContactListParams,
  ContactLogListParams,
} from "@/features/contact/types/contact";

export const contactQueryKeys = {
  all: ["contact"] as const,
  lists: () => [...contactQueryKeys.all, "list"] as const,
  list: (params: ContactListParams) =>
    [
      ...contactQueryKeys.lists(),
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search ?? "",
        companyId: params.companyId ?? "",
        includeDeleted: params.includeDeleted ?? false,
      },
    ] as const,
  details: () => [...contactQueryKeys.all, "detail"] as const,
  detail: (contactId: string) =>
    [...contactQueryKeys.details(), contactId] as const,
  logs: (contactId: string, params: ContactLogListParams) =>
    [
      ...contactQueryKeys.detail(contactId),
      "logs",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    ] as const,
};
