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

// 역할 : RefreshAppTokenCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface RefreshAppTokenCommand {
  readonly refreshToken: string;
  readonly origin: string | null;
}

// 역할 : RefreshAppTokenResult 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface RefreshAppTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

// 역할 : RefreshAppTokenUseCase 유스케이스의 application orchestration을 담당합니다.
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
    // 1. refresh 요청 Origin이 허용된 프론트엔드 origin인지 검증한다.
    this.assertAllowedOrigin(command.origin);

    // 2. refresh token 원문을 hash로 변환해 세션 조회 키를 만든다.
    const refreshTokenHash = this.secureTokenService.hash(
      `refresh:${command.refreshToken}`
    );

    // 3. refresh token hash로 세션과 사용자 정보를 조회한다.
    const record =
      await this.authRepository.findSessionByRefreshTokenHash(refreshTokenHash);

    // 4. 세션 존재 여부와 활성 상태를 검증한다.
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

    // 5. refresh token을 회전하고 세션 만료 시각을 갱신한다.
    const now = new Date();
    const nextRefreshToken = this.secureTokenService.createToken();
    await this.authRepository.rotateRefreshToken(
      record.session.id,
      this.secureTokenService.hash(`refresh:${nextRefreshToken}`),
      this.addDays(now, this.getSessionTtlDays()),
      now
    );

    // 6. 기존 세션 ID 기준으로 새 앱 access token을 발급한다.
    const issuedToken = await this.appTokenIssuer.issueAccessToken({
      userId: record.user.id,
      sessionId: record.session.id,
    });

    // 7. 최신 사용자 응답 정보를 조회한다.
    const me = await this.authRepository.getMe(record.user.id);

    if (!me) {
      throw new InactiveUserError();
    }

    // 8. 새 refresh token과 앱 access token 응답을 반환한다.
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

