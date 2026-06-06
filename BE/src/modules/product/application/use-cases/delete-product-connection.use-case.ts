import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteResponse } from "../product-response";

@Injectable()
export class DeleteProductConnectionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    connectionId: string
  ) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.productRepository.deleteProductConnection(
      currentUser.id,
      productId,
      connectionId,
      now,
      permanentDeleteAt
    );

    return toDeleteResponse(result);
  }
}
