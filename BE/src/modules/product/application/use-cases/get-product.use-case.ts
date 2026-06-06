import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductDetailResponse } from "../product-response";
import { assertNotDeleted, assertProductExists } from "./product-input";

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(currentUser: CurrentUserContext, productId: string) {
    const detail = assertProductExists(
      await this.productRepository.getProductDetail(currentUser.id, productId)
    );
    assertNotDeleted(detail.product.deletedAt, "read");

    return toProductDetailResponse(detail);
  }
}
