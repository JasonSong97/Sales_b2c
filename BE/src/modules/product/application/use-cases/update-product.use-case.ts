import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductResponse } from "../product-response";
import {
  normalizeCurrency,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeUnitPrice,
} from "./product-input";

export interface UpdateProductCommand {
  readonly name?: string;
  readonly category?: string | null;
  readonly unitPrice?: number | null;
  readonly currency?: string;
  readonly description?: string | null;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    command: UpdateProductCommand
  ) {
    const product = await this.productRepository.updateProduct({
      userId: currentUser.id,
      productId,
      ...(command.name !== undefined
        ? { name: normalizeRequiredText(command.name) }
        : {}),
      ...(command.category !== undefined
        ? { category: normalizeOptionalText(command.category) }
        : {}),
      ...(command.unitPrice !== undefined
        ? { unitPrice: normalizeUnitPrice(command.unitPrice) }
        : {}),
      ...(command.currency !== undefined
        ? { currency: normalizeCurrency(command.currency) }
        : {}),
      ...(command.description !== undefined
        ? { description: normalizeOptionalText(command.description) }
        : {}),
    });

    return toProductResponse(product);
  }
}
