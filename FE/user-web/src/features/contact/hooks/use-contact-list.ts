import { useQuery } from "@tanstack/react-query";
import { listContacts } from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import type { ContactListParams } from "@/features/contact/types/contact";

export function useContactList(params: ContactListParams) {
  return useQuery({
    queryKey: contactQueryKeys.list(params),
    queryFn: () => listContacts(params),
  });
}
