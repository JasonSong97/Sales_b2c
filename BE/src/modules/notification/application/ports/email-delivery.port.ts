export const EMAIL_DELIVERY_PORT = Symbol("EMAIL_DELIVERY_PORT");

export interface SendEmailNotificationInput {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly targetPath: string | null;
}

export interface EmailDeliveryPort {
  sendNotification(input: SendEmailNotificationInput): Promise<void>;
}
