import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductLogResponse } from "../product-response";
import { normalizeOptionalText, normalizeRequiredText } from "./product-input";

export interface UpdateProductLogCommand {
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

@Injectable()
export class UpdateProductLogUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    logId: string,
    command: UpdateProductLogCommand
  ) {
    return toProductLogResponse(
      await this.productRepository.updateProductLog({
        userId: currentUser.id,
        productId,
        logId,
        ...(command.loggedAt !== undefined ? { loggedAt: command.loggedAt } : {}),
        ...(command.title !== undefined
          ? { title: normalizeRequiredText(command.title) }
          : {}),
        ...(command.content !== undefined
          ? { content: normalizeOptionalText(command.content) ?? "" }
          : {}),
      })
    );
  }
}
