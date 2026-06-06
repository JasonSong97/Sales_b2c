import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductLogResponse } from "../product-response";
import { normalizeOptionalText, normalizeRequiredText } from "./product-input";

export interface CreateProductLogCommand {
  readonly loggedAt: Date;
  readonly title: string;
  readonly content?: string;
}

@Injectable()
export class CreateProductLogUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    command: CreateProductLogCommand
  ) {
    return toProductLogResponse(
      await this.productRepository.createProductLog({
        userId: currentUser.id,
        productId,
        loggedAt: command.loggedAt,
        title: normalizeRequiredText(command.title),
        content: normalizeOptionalText(command.content) ?? "",
      })
    );
  }
}
