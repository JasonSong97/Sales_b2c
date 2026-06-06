import type {
  ProductConnectionTargetType,
  ProductConnectionType,
} from "@/modules/product/application/ports/product.repository";
import {
  ProductLogNotFoundError,
  ProductNotFoundError,
} from "@/modules/product/domain/product.errors";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";

const PRODUCT_CONNECTION_TARGET_TYPES: ProductConnectionTargetType[] = [
  "COMPANY",
  "CONTACT",
  "DEAL",
];

const PRODUCT_CONNECTION_TYPES: ProductConnectionType[] = [
  "INTERESTED",
  "DELIVERED",
  "PROPOSED",
  "COMPETITOR",
  "MAINTENANCE",
  "OTHER",
];

export function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError("Required text field is empty");
  }

  return trimmed;
}

export function normalizeCurrency(value: string | null | undefined): string {
  const normalized = normalizeOptionalText(value)?.toUpperCase() ?? "KRW";

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ValidationDomainError("Invalid currency");
  }

  return normalized;
}

export function normalizeUnitPrice(value: number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationDomainError("Unit price must be a non-negative integer");
  }

  return value;
}

export function normalizePagination(input: {
  readonly page?: number;
  readonly pageSize?: number;
}): { page: number; pageSize: number } {
  const page = input.page && input.page > 0 ? input.page : 1;
  const pageSize =
    input.pageSize && input.pageSize > 0
      ? Math.min(input.pageSize, 100)
      : 20;

  return { page, pageSize };
}

export function normalizeProductConnectionTargetType(
  value: string
): ProductConnectionTargetType {
  if (PRODUCT_CONNECTION_TARGET_TYPES.includes(value as ProductConnectionTargetType)) {
    return value as ProductConnectionTargetType;
  }

  throw new ValidationDomainError("Invalid product connection target type");
}

export function normalizeProductConnectionType(
  value: string
): ProductConnectionType {
  if (PRODUCT_CONNECTION_TYPES.includes(value as ProductConnectionType)) {
    return value as ProductConnectionType;
  }

  throw new ValidationDomainError("Invalid product connection type");
}

export function assertProductExists<TProduct>(
  product: TProduct | null
): TProduct {
  if (!product) {
    throw new ProductNotFoundError();
  }

  return product;
}

export function assertProductLogExists<TLog>(log: TLog | null): TLog {
  if (!log) {
    throw new ProductLogNotFoundError();
  }

  return log;
}

export function assertNotDeleted(
  deletedAt: Date | null,
  operation: "read" | "write"
): void {
  if (deletedAt) {
    throw new DeletedResourceError(operation);
  }
}
