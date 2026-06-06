import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toProductConnectionResponse } from "../product-response";
import {
  normalizeOptionalText,
  normalizeProductConnectionTargetType,
  normalizeProductConnectionType,
  normalizeRequiredText,
} from "./product-input";

export interface CreateProductConnectionCommand {
  readonly targetType: string;
  readonly targetId: string;
  readonly connectionType: string;
  readonly note?: string;
}

@Injectable()
export class CreateProductConnectionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    productId: string,
    command: CreateProductConnectionCommand
  ) {
    return toProductConnectionResponse(
      await this.productRepository.createProductConnection({
        userId: currentUser.id,
        productId,
        targetType: normalizeProductConnectionTargetType(command.targetType),
        targetId: normalizeRequiredText(command.targetId),
        connectionType: normalizeProductConnectionType(command.connectionType),
        note: normalizeOptionalText(command.note),
      })
    );
  }
}
