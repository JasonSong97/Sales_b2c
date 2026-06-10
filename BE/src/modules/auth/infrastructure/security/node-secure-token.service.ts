import { randomBytes, createHmac } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SecureTokenService } from "@/modules/auth/application/ports/secure-token.port";

@Injectable()
export class NodeSecureTokenService implements SecureTokenService {
  // 기능 : 보안 토큰 해시 비밀키 설정을 읽기 위한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : refresh token 등에 사용할 안전한 랜덤 토큰을 생성합니다.
  createToken(): string {
    return randomBytes(48).toString("base64url");
  }

  // 기능 : 지정 문자열을 HMAC SHA-256 해시로 변환합니다.
  hash(value: string): string {
    return createHmac("sha256", this.getSecret()).update(value).digest("hex");
  }

  // 기능 : refresh token 해시에 사용할 비밀키를 환경 변수에서 읽습니다.
  private getSecret(): string {
    const secret =
      this.configService.get<string>("APP_REFRESH_TOKEN_SECRET") ??
      this.configService.get<string>("APP_JWT_SECRET");

    if (!secret || secret.trim().length === 0) {
      throw new Error(
        "Missing required environment variable: APP_REFRESH_TOKEN_SECRET"
      );
    }

    return secret;
  }
}

