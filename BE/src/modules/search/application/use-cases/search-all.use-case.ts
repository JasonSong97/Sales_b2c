import { Inject, Injectable } from "@nestjs/common";
import {
  SEARCH_REPOSITORY,
  type SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import { toSearchAllResponse } from "@/modules/search/application/search-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  normalizeSearchTypes,
} from "./search-input";

export interface SearchAllQuery {
  readonly q?: string;
  readonly types?: string;
  readonly limit?: number;
}

@Injectable()
export class SearchAllUseCase {
  constructor(
    @Inject(SEARCH_REPOSITORY)
    private readonly searchRepository: SearchRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: SearchAllQuery) {
    const result = await this.searchRepository.searchAll({
      userId: currentUser.id,
      q: normalizeSearchQuery(query.q),
      types: normalizeSearchTypes(query.types),
      limit: normalizeSearchLimit(query.limit),
    });

    return toSearchAllResponse(result);
  }
}
