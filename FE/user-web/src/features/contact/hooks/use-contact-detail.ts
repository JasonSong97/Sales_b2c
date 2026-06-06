import { useQuery } from "@tanstack/react-query";
import { getContact, listContactLogs } from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import type { ContactLogListParams } from "@/features/contact/types/contact";

export function useContactDetail(contactId: string) {
  return useQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.detail(contactId),
    queryFn: () => getContact(contactId),
  });
}

export function useContactLogs(
  contactId: string,
  params: ContactLogListParams = {}
) {
  return useQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.logs(contactId, params),
    queryFn: () => listContactLogs(contactId, params),
  });
}
