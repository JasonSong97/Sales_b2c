import { Inject, Injectable } from "@nestjs/common";
import {
  BUSINESS_CARD_REPOSITORY,
  type BusinessCardRepository,
} from "@/modules/business-card/application/ports/business-card.repository";
import { BusinessCardScanNotFoundError } from "@/modules/business-card/domain/business-card.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toBusinessCardScanDetailResponse } from "../business-card-response";

@Injectable()
export class GetBusinessCardScanUseCase {
  constructor(
    @Inject(BUSINESS_CARD_REPOSITORY)
    private readonly businessCardRepository: BusinessCardRepository
  ) {}

  async execute(currentUser: CurrentUserContext, scanId: string) {
    const detail = await this.businessCardRepository.getScanDetail(
      currentUser.id,
      scanId
    );

    if (!detail) {
      throw new BusinessCardScanNotFoundError();
    }

    return toBusinessCardScanDetailResponse(detail);
  }
}
