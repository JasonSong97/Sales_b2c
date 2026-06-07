import * as webPush from "web-push";
import { ConfigService } from "@nestjs/config";
import type {
  BrowserPushPort,
  SendBrowserPushNotificationInput,
} from "@/modules/notification/application/ports/browser-push.port";

export class WebPushVapidAdapter implements BrowserPushPort {
  constructor(private readonly configService: ConfigService) {
    webPush.setVapidDetails(
      requiredConfig(configService, "VAPID_SUBJECT"),
      requiredConfig(configService, "VAPID_PUBLIC_KEY"),
      requiredConfig(configService, "VAPID_PRIVATE_KEY")
    );
  }

  async sendNotification(
    input: SendBrowserPushNotificationInput
  ): Promise<void> {
    await webPush.sendNotification(
      {
        endpoint: input.subscription.endpoint,
        keys: input.subscription.keys,
      },
      JSON.stringify({
        title: input.title,
        body: input.body,
        targetPath: input.targetPath,
      })
    );
  }
}

function requiredConfig(configService: ConfigService, key: string) {
  const value = configService.get<string>(key);

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
