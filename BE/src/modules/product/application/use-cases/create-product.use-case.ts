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

export interface CreateProductCommand {
  readonly name: string;
  readonly category?: string;
  readonly unitPrice?: number;
  readonly currency?: string;
  readonly description?: string;
  readonly initialMemo?: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateProductCommand) {
    const product = await this.productRepository.createProduct({
      userId: currentUser.id,
      name: normalizeRequiredText(command.name),
      category: normalizeOptionalText(command.category),
      unitPrice: normalizeUnitPrice(command.unitPrice),
      currency: normalizeCurrency(command.currency),
      description: normalizeOptionalText(command.description),
      initialMemo: normalizeOptionalText(command.initialMemo),
    });

    return toProductResponse(product);
  }
}
