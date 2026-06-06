import { z } from "zod";
import type {
  Contact,
  CreateContactInput,
  CreateContactLogInput,
  UpdateContactInput,
  UpdateContactLogInput,
} from "@/features/contact/types/contact";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const loosePhonePattern = /^[0-9+\-\s().]{6,30}$/;

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요."),
  companyId: z.string().trim().optional(),
  companySearch: z.string().trim().optional(),
  department: z.string().trim().optional(),
  position: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || loosePhonePattern.test(value),
      "전화번호 형식을 확인해주세요."
    )
    .optional(),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || emailPattern.test(value),
      "이메일 형식을 확인해주세요."
    )
    .optional(),
  address: z.string().trim().optional(),
  initialMemo: z.string().trim().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactLogFormSchema = z.object({
  loggedAt: z.string().trim().min(1, "기록 시간을 입력해주세요."),
  title: z.string().trim().min(1, "로그 제목을 입력해주세요."),
  content: z.string().trim().optional(),
});

export type ContactLogFormValues = z.infer<typeof contactLogFormSchema>;

export const emptyContactFormValues: ContactFormValues = {
  name: "",
  companyId: "",
  companySearch: "",
  department: "",
  position: "",
  phone: "",
  email: "",
  address: "",
  initialMemo: "",
};

export function toContactFormValues(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    companyId: contact.companyId ?? "",
    companySearch: contact.companyName ?? "",
    department: contact.department ?? "",
    position: contact.position ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    initialMemo: "",
  };
}

export function toCreateContactInput(
  values: ContactFormValues
): CreateContactInput {
  return {
    name: values.name.trim(),
    companyId: optionalText(values.companyId),
    department: optionalText(values.department),
    position: optionalText(values.position),
    phone: optionalText(values.phone),
    email: optionalText(values.email),
    address: optionalText(values.address),
    initialMemo: optionalText(values.initialMemo),
  };
}

export function toUpdateContactInput(
  contactId: string,
  values: ContactFormValues
): UpdateContactInput {
  return {
    contactId,
    name: values.name.trim(),
    companyId: nullableText(values.companyId),
    department: nullableText(values.department),
    position: nullableText(values.position),
    phone: nullableText(values.phone),
    email: nullableText(values.email),
    address: nullableText(values.address),
  };
}

export function toCreateContactLogInput(
  contactId: string,
  values: ContactLogFormValues
): CreateContactLogInput {
  return {
    contactId,
    loggedAt: toIsoDateTime(values.loggedAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toUpdateContactLogInput(
  contactId: string,
  logId: string,
  values: ContactLogFormValues
): UpdateContactLogInput {
  return {
    contactId,
    logId,
    loggedAt: toIsoDateTime(values.loggedAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offsetMs = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function optionalText(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

function nullableText(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}
