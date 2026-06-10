import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import {
  SECURE_TOKEN_SERVICE,
  type SecureTokenService,
} from "@/modules/auth/application/ports/secure-token.port";
import {
  InactiveUserError,
  InvalidRefreshOriginError,
} from "@/modules/auth/domain/auth.errors";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";
import { createAuthTokenResponse, type AuthTokenResponse } from "../auth-response";

export interface RefreshAppTokenCommand {
  readonly refreshToken: string;
  readonly origin: string | null;
}

export interface RefreshAppTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

@Injectable()
export class RefreshAppTokenUseCase {
  // 기능 : 인증 저장소, 앱 토큰 발급기, 보안 토큰 서비스, 설정 서비스를 주입받습니다.
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(SECURE_TOKEN_SERVICE)
    private readonly secureTokenService: SecureTokenService,
    private readonly configService: ConfigService
  ) {}

  // 기능 : refresh token을 검증하고 세션을 회전시킨 뒤 새 앱 토큰 응답을 반환합니다.
  async execute(command: RefreshAppTokenCommand): Promise<RefreshAppTokenResult> {
    this.assertAllowedOrigin(command.origin);
    const refreshTokenHash = this.secureTokenService.hash(
      `refresh:${command.refreshToken}`
    );
    const record =
      await this.authRepository.findSessionByRefreshTokenHash(refreshTokenHash);

    if (!record) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (
      record.session.status !== "ACTIVE" ||
      record.session.revokedAt ||
      record.session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedError("Expired refresh session");
    }

    if (record.user.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    const now = new Date();
    const nextRefreshToken = this.secureTokenService.createToken();
    await this.authRepository.rotateRefreshToken(
      record.session.id,
      this.secureTokenService.hash(`refresh:${nextRefreshToken}`),
      this.addDays(now, this.getSessionTtlDays()),
      now
    );
    const issuedToken = await this.appTokenIssuer.issueAccessToken({
      userId: record.user.id,
      sessionId: record.session.id,
    });
    const me = await this.authRepository.getMe(record.user.id);

    if (!me) {
      throw new InactiveUserError();
    }

    return {
      refreshToken: nextRefreshToken,
      response: createAuthTokenResponse({
        accessToken: issuedToken.accessToken,
        accessTokenExpiresAt: issuedToken.accessTokenExpiresAt,
        user: me,
      }),
    };
  }

  // 기능 : refresh 요청 Origin이 허용 목록에 있는지 검증합니다.
  private assertAllowedOrigin(origin: string | null): void {
    if (!origin || !this.getAllowedOrigins().includes(origin)) {
      throw new InvalidRefreshOriginError();
    }
  }

  // 기능 : 환경 변수 또는 웹 Origin 설정에서 refresh 허용 Origin 목록을 계산합니다.
  private getAllowedOrigins(): string[] {
    const explicit = this.configService.get<string>("APP_ALLOWED_ORIGINS");

    if (explicit && explicit.trim().length > 0) {
      return explicit
        .split(",")
        // 기능 : Origin 목록 항목의 앞뒤 공백을 제거합니다.
        .map((item) => item.trim())
        // 기능 : 빈 Origin 항목을 제외합니다.
        .filter((item) => item.length > 0);
    }

    return [
      this.configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      this.configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ];
  }

  // 기능 : 세션 만료 기간 설정값을 일 단위 숫자로 반환합니다.
  private getSessionTtlDays(): number {
    const value = Number(
      this.configService.get<string>("APP_SESSION_TTL_DAYS") ?? "7"
    );

    return Number.isFinite(value) && value > 0 ? value : 7;
  }

  // 기능 : 기준 날짜에 지정한 일수를 더한 날짜를 반환합니다.
  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

