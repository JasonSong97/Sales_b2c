import { z } from "zod";
import type {
  CreateProductConnectionInput,
  CreateProductInput,
  CreateProductLogInput,
  Product,
  ProductConnectionType,
  ProductConnectionTargetType,
  UpdateProductInput,
  UpdateProductLogInput,
} from "@/features/product/types/product";

const currencyPattern = /^[A-Za-z]{3}$/;

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "제품명을 입력해주세요."),
  category: z.string().trim().optional(),
  unitPrice: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
      "단가는 0 이상의 정수로 입력해주세요."
    )
    .optional(),
  currency: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || currencyPattern.test(value),
      "통화는 KRW처럼 3자리 코드로 입력해주세요."
    )
    .optional(),
  description: z.string().trim().optional(),
  initialMemo: z.string().trim().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productConnectionFormSchema = z.object({
  targetType: z.enum(["COMPANY", "CONTACT", "DEAL"]),
  targetId: z.string().trim().min(1, "연결 대상을 선택해주세요."),
  targetSearch: z.string().trim().optional(),
  connectionType: z.enum([
    "INTERESTED",
    "DELIVERED",
    "PROPOSED",
    "COMPETITOR",
    "MAINTENANCE",
    "OTHER",
  ]),
  note: z.string().trim().optional(),
});

export type ProductConnectionFormValues = z.infer<
  typeof productConnectionFormSchema
>;

export const productLogFormSchema = z.object({
  loggedAt: z.string().trim().min(1, "기록 시간을 입력해주세요."),
  title: z.string().trim().min(1, "로그 제목을 입력해주세요."),
  content: z.string().trim().optional(),
});

export type ProductLogFormValues = z.infer<typeof productLogFormSchema>;

export const emptyProductFormValues: ProductFormValues = {
  name: "",
  category: "",
  unitPrice: "",
  currency: "KRW",
  description: "",
  initialMemo: "",
};

export const emptyProductConnectionFormValues: ProductConnectionFormValues = {
  targetType: "COMPANY",
  targetId: "",
  targetSearch: "",
  connectionType: "INTERESTED",
  note: "",
};

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    category: product.category ?? "",
    unitPrice: product.unitPrice === null ? "" : String(product.unitPrice),
    currency: product.currency,
    description: product.description ?? "",
    initialMemo: "",
  };
}

export function toCreateProductInput(
  values: ProductFormValues
): CreateProductInput {
  return {
    name: values.name.trim(),
    category: optionalText(values.category),
    unitPrice: optionalNumber(values.unitPrice),
    currency: normalizeCurrency(values.currency),
    description: optionalText(values.description),
    initialMemo: optionalText(values.initialMemo),
  };
}

export function toUpdateProductInput(
  productId: string,
  values: ProductFormValues
): UpdateProductInput {
  return {
    productId,
    name: values.name.trim(),
    category: nullableText(values.category),
    unitPrice: nullableNumber(values.unitPrice),
    currency: normalizeCurrency(values.currency),
    description: nullableText(values.description),
  };
}

export function toCreateProductConnectionInput(
  productId: string,
  values: ProductConnectionFormValues
): CreateProductConnectionInput {
  return {
    productId,
    targetType: values.targetType as ProductConnectionTargetType,
    targetId: values.targetId.trim(),
    connectionType: values.connectionType as ProductConnectionType,
    note: optionalText(values.note),
  };
}

export function toCreateProductLogInput(
  productId: string,
  values: ProductLogFormValues
): CreateProductLogInput {
  return {
    productId,
    loggedAt: toIsoDateTime(values.loggedAt),
    title: values.title.trim(),
    content: optionalText(values.content),
  };
}

export function toUpdateProductLogInput(
  productId: string,
  logId: string,
  values: ProductLogFormValues
): UpdateProductLogInput {
  return {
    productId,
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

function optionalNumber(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? Number(trimmed) : undefined;
}

function nullableNumber(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? Number(trimmed) : null;
}

function normalizeCurrency(value: string | undefined | null) {
  const trimmed = value?.trim().toUpperCase() ?? "";

  return trimmed.length > 0 ? trimmed : "KRW";
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}
