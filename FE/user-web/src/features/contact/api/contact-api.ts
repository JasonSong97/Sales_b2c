import type {
  Contact,
  ContactDetail,
  ContactListParams,
  ContactListResponse,
  ContactLog,
  ContactLogListParams,
  ContactLogListResponse,
  CreateContactInput,
  CreateContactLogInput,
  DeleteContactResponse,
  UpdateContactInput,
  UpdateContactLogInput,
} from "@/features/contact/types/contact";
import { apiClient } from "@/lib/api-client";

export function listContacts(params: ContactListParams) {
  const query = toContactListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ContactListResponse>(`/api/contacts${suffix}`);
}

export function createContact(input: CreateContactInput) {
  return apiClient<Contact>("/api/contacts", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getContact(contactId: string) {
  return apiClient<ContactDetail>(`/api/contacts/${contactId}`);
}

export function updateContact(input: UpdateContactInput) {
  return apiClient<Contact>(`/api/contacts/${input.contactId}`, {
    method: "PATCH",
    body: compactBody({
      name: input.name,
      companyId: input.companyId,
      department: input.department,
      position: input.position,
      phone: input.phone,
      email: input.email,
      address: input.address,
    }),
  });
}

export function deleteContact(contactId: string) {
  return apiClient<DeleteContactResponse>(`/api/contacts/${contactId}`, {
    method: "DELETE",
  });
}

export function restoreContact(contactId: string) {
  return apiClient<Contact>(`/api/contacts/${contactId}/restore`, {
    method: "POST",
  });
}

export function listContactLogs(
  contactId: string,
  params: ContactLogListParams
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return apiClient<ContactLogListResponse>(
    `/api/contacts/${contactId}/logs?${query.toString()}`
  );
}

export function createContactLog(input: CreateContactLogInput) {
  return apiClient<ContactLog>(`/api/contacts/${input.contactId}/logs`, {
    method: "POST",
    body: compactBody({
      loggedAt: input.loggedAt,
      title: input.title,
      content: input.content,
    }),
  });
}

export function updateContactLog(input: UpdateContactLogInput) {
  return apiClient<ContactLog>(
    `/api/contacts/${input.contactId}/logs/${input.logId}`,
    {
      method: "PATCH",
      body: compactBody({
        loggedAt: input.loggedAt,
        title: input.title,
        content: input.content,
      }),
    }
  );
}

export function deleteContactLog(contactId: string, logId: string) {
  return apiClient<DeleteContactResponse>(
    `/api/contacts/${contactId}/logs/${logId}`,
    {
      method: "DELETE",
    }
  );
}

function toContactListSearchParams(params: ContactListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.companyId) {
    searchParams.set("companyId", params.companyId);
  }

  if (params.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
