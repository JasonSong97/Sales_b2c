import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductResponse } from "../product-response";

@Injectable()
export class RestoreProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(currentUser: CurrentUserContext, productId: string) {
    return toProductResponse(
      await this.productRepository.restoreProduct(currentUser.id, productId)
    );
  }
}
