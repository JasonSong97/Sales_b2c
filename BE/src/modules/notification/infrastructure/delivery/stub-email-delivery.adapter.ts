import type {
  EmailDeliveryPort,
  SendEmailNotificationInput,
} from "@/modules/notification/application/ports/email-delivery.port";

export class StubEmailDeliveryAdapter implements EmailDeliveryPort {
  readonly sent: SendEmailNotificationInput[] = [];

  async sendNotification(input: SendEmailNotificationInput): Promise<void> {
    this.sent.push(input);
  }
}
