import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import { NotificationScheduler } from "@/modules/notification/application/use-cases/notification-scheduler.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";
import { normalizeOptionalDate, normalizeOptionalText } from "./deal-input";

export interface CompleteDealNextActionCommand {
  readonly completedAt?: string;
  readonly activityContent?: string;
}

@Injectable()
export class CompleteDealNextActionUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository,
    private readonly notificationScheduler: NotificationScheduler
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: CompleteDealNextActionCommand
  ) {
    const deal = await this.dealRepository.completeDealNextAction({
      userId: currentUser.id,
      dealId,
      completedAt: normalizeOptionalDate(command.completedAt) ?? new Date(),
      activityContent: normalizeOptionalText(command.activityContent),
    });

    await this.notificationScheduler.replaceNextActionNotification({
      userId: currentUser.id,
      dealId: deal.id,
      dealTitle: deal.title,
      nextActionText: deal.nextActionText,
      nextActionDueAt: deal.nextActionDueAt,
      nextActionStatus: deal.nextActionStatus,
    });

    return toDealResponse(deal);
  }
}
