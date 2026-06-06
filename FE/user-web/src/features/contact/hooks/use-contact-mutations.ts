import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  createContactLog,
  deleteContact,
  deleteContactLog,
  restoreContact,
  updateContact,
  updateContactLog,
} from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import type {
  CreateContactInput,
  CreateContactLogInput,
  UpdateContactInput,
  UpdateContactLogInput,
} from "@/features/contact/types/contact";

export function useCreateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: (contact) => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(contact.id),
      });
    },
  });
}

export function useUpdateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) => updateContact(input),
    onSuccess: (contact) => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(contact.id),
      });
    },
  });
}

export function useDeleteContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(result.id),
      });
    },
  });
}

export function useRestoreContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => restoreContact(contactId),
    onSuccess: (contact) => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(contact.id),
      });
    },
  });
}

export function useCreateContactLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactLogInput) => createContactLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(log.contactId),
      });
    },
  });
}

export function useUpdateContactLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactLogInput) => updateContactLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(log.contactId),
      });
    },
  });
}

export function useDeleteContactLogMutation(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteContactLog(contactId, logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(contactId),
      });
    },
  });
}
