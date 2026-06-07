import type {
  BrowserPushPort,
  SendBrowserPushNotificationInput,
} from "@/modules/notification/application/ports/browser-push.port";

export class StubBrowserPushAdapter implements BrowserPushPort {
  readonly sent: SendBrowserPushNotificationInput[] = [];

  async sendNotification(input: SendBrowserPushNotificationInput): Promise<void> {
    this.sent.push(input);
  }
}
