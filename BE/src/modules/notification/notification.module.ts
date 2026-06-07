import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/auth.module";
import { BROWSER_PUSH_PORT } from "@/modules/notification/application/ports/browser-push.port";
import { EMAIL_DELIVERY_PORT } from "@/modules/notification/application/ports/email-delivery.port";
import { NOTIFICATION_REPOSITORY } from "@/modules/notification/application/ports/notification.repository";
import { CreateBrowserPushSubscriptionUseCase } from "@/modules/notification/application/use-cases/create-browser-push-subscription.use-case";
import { GetBrowserPushPublicKeyUseCase } from "@/modules/notification/application/use-cases/get-browser-push-public-key.use-case";
import { ListNotificationsUseCase } from "@/modules/notification/application/use-cases/list-notifications.use-case";
import { MarkNotificationReadUseCase } from "@/modules/notification/application/use-cases/mark-notification-read.use-case";
import { NotificationScheduler } from "@/modules/notification/application/use-cases/notification-scheduler.service";
import { RevokeBrowserPushSubscriptionUseCase } from "@/modules/notification/application/use-cases/revoke-browser-push-subscription.use-case";
import { SendPendingNotificationsUseCase } from "@/modules/notification/application/use-cases/send-pending-notifications.use-case";
import { UpdateNotificationSettingsUseCase } from "@/modules/notification/application/use-cases/update-notification-settings.use-case";
import { StubBrowserPushAdapter } from "@/modules/notification/infrastructure/delivery/stub-browser-push.adapter";
import { StubEmailDeliveryAdapter } from "@/modules/notification/infrastructure/delivery/stub-email-delivery.adapter";
import { SmtpEmailDeliveryAdapter } from "@/modules/notification/infrastructure/delivery/smtp-email-delivery.adapter";
import { WebPushVapidAdapter } from "@/modules/notification/infrastructure/delivery/web-push-vapid.adapter";
import { PrismaNotificationRepository } from "@/modules/notification/infrastructure/persistence/prisma-notification.repository";
import {
  ENCRYPTION_PORT,
  type EncryptionPort,
} from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { NotificationController } from "./presentation/http/notification.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [NotificationController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    UpdateNotificationSettingsUseCase,
    GetBrowserPushPublicKeyUseCase,
    CreateBrowserPushSubscriptionUseCase,
    RevokeBrowserPushSubscriptionUseCase,
    NotificationScheduler,
    SendPendingNotificationsUseCase,
    {
      provide: NOTIFICATION_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaNotificationRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
    {
      provide: EMAIL_DELIVERY_PORT,
      useFactory: (configService: ConfigService) =>
        isSmtpConfigured(configService)
          ? new SmtpEmailDeliveryAdapter(configService)
          : new StubEmailDeliveryAdapter(),
      inject: [ConfigService],
    },
    {
      provide: BROWSER_PUSH_PORT,
      useFactory: (configService: ConfigService) =>
        isWebPushConfigured(configService)
          ? new WebPushVapidAdapter(configService)
          : new StubBrowserPushAdapter(),
      inject: [ConfigService],
    },
  ],
  exports: [NotificationScheduler, SendPendingNotificationsUseCase],
})
export class NotificationModule {}

function isSmtpConfigured(configService: ConfigService) {
  return [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
  ].every((key) => Boolean(configService.get<string>(key)));
}

function isWebPushConfigured(configService: ConfigService) {
  return [
    "VAPID_SUBJECT",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
  ].every((key) => Boolean(configService.get<string>(key)));
}
