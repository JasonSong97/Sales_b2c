export const BROWSER_PUSH_PORT = Symbol("BROWSER_PUSH_PORT");

export interface BrowserPushSubscriptionPayload {
  readonly endpoint: string;
  readonly keys: {
    readonly p256dh: string;
    readonly auth: string;
  };
}

export interface SendBrowserPushNotificationInput {
  readonly subscription: BrowserPushSubscriptionPayload;
  readonly title: string;
  readonly body: string;
  readonly targetPath: string | null;
}

export interface BrowserPushPort {
  sendNotification(input: SendBrowserPushNotificationInput): Promise<void>;
}
