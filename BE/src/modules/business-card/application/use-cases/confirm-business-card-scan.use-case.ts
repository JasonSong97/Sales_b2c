import { Inject, Injectable } from "@nestjs/common";
import {
  type BusinessCardCompanyMode,
  BUSINESS_CARD_REPOSITORY,
  type BusinessCardRepository,
} from "@/modules/business-card/application/ports/business-card.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toBusinessCardConfirmResponse } from "../business-card-response";
import {
  normalizeOptionalText,
  normalizeRequiredId,
  normalizeRequiredText,
} from "./business-card-input";

export interface ConfirmBusinessCardScanCommand {
  readonly companyMode: BusinessCardCompanyMode;
  readonly companyId?: string;
  readonly companyName?: string;
  readonly contactName: string;
  readonly department?: string;
  readonly position?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
}

@Injectable()
export class ConfirmBusinessCardScanUseCase {
  constructor(
    @Inject(BUSINESS_CARD_REPOSITORY)
    private readonly businessCardRepository: BusinessCardRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    scanId: string,
    command: ConfirmBusinessCardScanCommand
  ) {
    const result = await this.businessCardRepository.confirmScan({
      userId: currentUser.id,
      scanId: normalizeRequiredId(scanId, "scanId"),
      companyMode: command.companyMode,
      companyId:
        command.companyMode === "EXISTING"
          ? normalizeRequiredId(command.companyId ?? "", "companyId")
          : null,
      companyName:
        command.companyMode === "NEW"
          ? normalizeRequiredText(command.companyName ?? "", "companyName")
          : null,
      contactName: normalizeRequiredText(command.contactName, "contactName"),
      department: normalizeOptionalText(command.department),
      position: normalizeOptionalText(command.position),
      phone: normalizeOptionalText(command.phone),
      email: normalizeOptionalText(command.email),
      address: normalizeOptionalText(command.address),
    });

    return toBusinessCardConfirmResponse(result);
  }
}
