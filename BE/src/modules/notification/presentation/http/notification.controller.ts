import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateBrowserPushSubscriptionUseCase } from "@/modules/notification/application/use-cases/create-browser-push-subscription.use-case";
import { GetBrowserPushPublicKeyUseCase } from "@/modules/notification/application/use-cases/get-browser-push-public-key.use-case";
import { ListNotificationsUseCase } from "@/modules/notification/application/use-cases/list-notifications.use-case";
import { MarkNotificationReadUseCase } from "@/modules/notification/application/use-cases/mark-notification-read.use-case";
import { RevokeBrowserPushSubscriptionUseCase } from "@/modules/notification/application/use-cases/revoke-browser-push-subscription.use-case";
import { UpdateNotificationSettingsUseCase } from "@/modules/notification/application/use-cases/update-notification-settings.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateBrowserPushSubscriptionDto,
  UpdateNotificationSettingsDto,
} from "./dto/notification.dto";
import { ListNotificationsDto } from "./dto/notification-query.dto";

@UseGuards(AuthGuard)
@Controller("api/notifications")
export class NotificationController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase,
    private readonly getBrowserPushPublicKeyUseCase: GetBrowserPushPublicKeyUseCase,
    private readonly createBrowserPushSubscriptionUseCase: CreateBrowserPushSubscriptionUseCase,
    private readonly revokeBrowserPushSubscriptionUseCase: RevokeBrowserPushSubscriptionUseCase
  ) {}

  @Get()
  listNotifications(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListNotificationsDto
  ) {
    return this.listNotificationsUseCase.execute(currentUser, query);
  }

  @Patch(":notificationId/read")
  markNotificationRead(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("notificationId") notificationId: string
  ) {
    return this.markNotificationReadUseCase.execute(currentUser, notificationId);
  }

  @Patch("settings")
  updateNotificationSettings(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateNotificationSettingsDto
  ) {
    return this.updateNotificationSettingsUseCase.execute(currentUser, body);
  }

  @Get("browser-push/public-key")
  getBrowserPushPublicKey() {
    return this.getBrowserPushPublicKeyUseCase.execute();
  }

  @Post("browser-subscriptions")
  createBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateBrowserPushSubscriptionDto
  ) {
    return this.createBrowserPushSubscriptionUseCase.execute(currentUser, body);
  }

  @Delete("browser-subscriptions/:subscriptionId")
  revokeBrowserPushSubscription(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("subscriptionId") subscriptionId: string
  ) {
    return this.revokeBrowserPushSubscriptionUseCase.execute(
      currentUser,
      subscriptionId
    );
  }
}
