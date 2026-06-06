import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toPaginatedResponse, toProductLogResponse } from "../product-response";
import { normalizePagination } from "./product-input";

export interface ListProductLogsQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable()
export class ListProductLogsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    query: ListProductLogsQuery
  ) {
    const pagination = normalizePagination(query);
    const result = await this.productRepository.listProductLogs({
      userId: currentUser.id,
      productId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return toPaginatedResponse(result, toProductLogResponse);
  }
}
