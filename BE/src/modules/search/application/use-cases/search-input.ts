import type { SearchTargetType } from "@/modules/search/application/ports/search.repository";
import { SearchQueryRequiredError } from "@/modules/search/domain/search.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

export const SEARCH_TARGET_TYPES: readonly SearchTargetType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
];

const searchTargetTypeSet = new Set<SearchTargetType>(SEARCH_TARGET_TYPES);

export function normalizeSearchQuery(value: string | undefined) {
  const query = value?.trim() ?? "";

  if (query.length < 2) {
    throw new SearchQueryRequiredError();
  }

  return query;
}

export function normalizeSearchTypes(
  value: string | undefined
): readonly SearchTargetType[] {
  if (!value || value.trim().length === 0) {
    return SEARCH_TARGET_TYPES;
  }

  const normalizedTypes = value
    .split(",")
    .map((type) => type.trim().toUpperCase())
    .filter((type) => type.length > 0);

  if (normalizedTypes.length === 0) {
    return SEARCH_TARGET_TYPES;
  }

  const types = normalizedTypes.map((type) => {
    if (!searchTargetTypeSet.has(type as SearchTargetType)) {
      throw new ValidationDomainError("Invalid search target type");
    }

    return type as SearchTargetType;
  });

  return [...new Set(types)];
}

export function normalizeSearchLimit(value: number | undefined) {
  if (value === undefined) {
    return 5;
  }

  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new ValidationDomainError("Search limit must be between 1 and 10");
  }

  return value;
}
