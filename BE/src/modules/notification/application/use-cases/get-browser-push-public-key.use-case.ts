import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { BrowserPushPublicKeyResponse } from "@/modules/notification/application/notification-response";

@Injectable()
export class GetBrowserPushPublicKeyUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(): BrowserPushPublicKeyResponse {
    return {
      publicKey:
        this.configService.get<string>("VAPID_PUBLIC_KEY") ?? "",
    };
  }
}
