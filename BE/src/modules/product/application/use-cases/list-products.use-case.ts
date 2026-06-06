import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toPaginatedResponse, toProductResponse } from "../product-response";
import { normalizeOptionalText, normalizePagination } from "./product-input";

export interface ListProductsQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly category?: string;
  readonly includeDeleted?: boolean;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListProductsQuery) {
    const pagination = normalizePagination(query);
    const result = await this.productRepository.listProducts({
      userId: currentUser.id,
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: normalizeOptionalText(query.search),
      category: normalizeOptionalText(query.category),
      includeDeleted: query.includeDeleted ?? false,
    });

    return toPaginatedResponse(result, toProductResponse);
  }
}
