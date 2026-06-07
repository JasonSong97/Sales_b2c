import * as nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { ConfigService } from "@nestjs/config";
import type {
  EmailDeliveryPort,
  SendEmailNotificationInput,
} from "@/modules/notification/application/ports/email-delivery.port";

export class SmtpEmailDeliveryAdapter implements EmailDeliveryPort {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: requiredConfig(configService, "SMTP_HOST"),
      port: Number(configService.get<string>("SMTP_PORT") ?? 587),
      secure: configService.get<string>("SMTP_SECURE") === "true",
      auth: {
        user: requiredConfig(configService, "SMTP_USER"),
        pass: requiredConfig(configService, "SMTP_PASSWORD"),
      },
    });
  }

  async sendNotification(input: SendEmailNotificationInput): Promise<void> {
    const targetLine = input.targetPath ? `\n\n확인: ${input.targetPath}` : "";

    await this.transporter.sendMail({
      from: requiredConfig(this.configService, "SMTP_FROM"),
      to: input.to,
      subject: input.subject,
      text: `${input.text}${targetLine}`,
    });
  }
}

function requiredConfig(configService: ConfigService, key: string) {
  const value = configService.get<string>(key);

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
