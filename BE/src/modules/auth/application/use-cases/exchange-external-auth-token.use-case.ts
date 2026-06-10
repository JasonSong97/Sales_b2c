import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type AuthDeviceRecord,
  type AuthDeviceSlot,
  AUTH_REPOSITORY,
  type AuthRepository,
  type AuthUserRecord,
} from "@/modules/auth/application/ports/auth.repository";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  SECURE_TOKEN_SERVICE,
  type SecureTokenService,
} from "@/modules/auth/application/ports/secure-token.port";
import {
  DeviceSlotAlreadyRegisteredError,
  ExternalUserEmailMissingError,
  InactiveUserError,
  InvalidDeviceIdError,
  InvalidDeviceSlotError,
} from "@/modules/auth/domain/auth.errors";
import {
  EXTERNAL_AUTH_VERIFIER,
  type ExternalAuthVerifier,
  type VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import { createAuthTokenResponse, type AuthTokenResponse } from "../auth-response";

export interface ExchangeExternalAuthTokenCommand {
  readonly supabaseAccessToken: string;
  readonly deviceSlot: string;
  readonly deviceId: string;
  readonly deviceLabel: string | null;
  readonly replaceExistingDevice: boolean;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
}

export interface ExchangeExternalAuthTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

@Injectable()
export class ExchangeExternalAuthTokenUseCase {
  // 기능 : 외부 인증 검증기, 저장소, 토큰 서비스, 설정 서비스를 주입받습니다.
  constructor(
    @Inject(EXTERNAL_AUTH_VERIFIER)
    private readonly externalAuthVerifier: ExternalAuthVerifier,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(SECURE_TOKEN_SERVICE)
    private readonly secureTokenService: SecureTokenService,
    private readonly configService: ConfigService
  ) {}

  // 기능 : Supabase 토큰을 검증하고 사용자/기기/세션을 생성한 뒤 앱 토큰 응답을 반환합니다.
  async execute(
    command: ExchangeExternalAuthTokenCommand
  ): Promise<ExchangeExternalAuthTokenResult> {
    const verifiedUser = await this.externalAuthVerifier.verifyAccessToken(
      command.supabaseAccessToken
    );
    const email = this.normalizeEmail(verifiedUser.email);
    const slot = this.parseDeviceSlot(command.deviceSlot);
    this.assertDeviceId(command.deviceId);

    // 기능 : 인증 교환 전체 작업을 하나의 트랜잭션 콜백으로 실행합니다.
    return this.authRepository.runInTransaction(async (repository) => {
      const now = new Date();
      const user = await this.syncUser(repository, verifiedUser, email, now);
      this.assertActiveUser(user);

      const device = await this.resolveDevice(repository, {
        user,
        slot,
        deviceId: command.deviceId,
        deviceLabel: command.deviceLabel,
        replaceExistingDevice: command.replaceExistingDevice,
        now,
      });
      const refreshToken = this.secureTokenService.createToken();
      const session = await repository.createAuthSession({
        userId: user.id,
        authDeviceId: device.id,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: this.addDays(now, this.getSessionTtlDays()),
        userAgent: command.userAgent,
        ipAddressHash: command.ipAddress
          ? this.secureTokenService.hash(`ip:${command.ipAddress}`)
          : null,
        now,
      });
      const issuedToken = await this.appTokenIssuer.issueAccessToken({
        userId: user.id,
        sessionId: session.id,
      });
      const me = await repository.getMe(user.id);

      if (!me) {
        throw new InactiveUserError();
      }

      return {
        refreshToken,
        response: createAuthTokenResponse({
          accessToken: issuedToken.accessToken,
          accessTokenExpiresAt: issuedToken.accessTokenExpiresAt,
          user: me,
          device,
        }),
      };
    });
  }

  // 기능 : OAuth 계정 존재 여부에 따라 기존 사용자를 갱신하거나 새 사용자를 생성합니다.
  private async syncUser(
    repository: AuthRepository,
    verifiedUser: VerifiedExternalUser,
    email: string,
    now: Date
  ): Promise<AuthUserRecord> {
    const oauthAccount = await repository.findOAuthAccount(
      verifiedUser.provider,
      verifiedUser.providerAccountId
    );
    const adminRole = this.isInitialAdminEmail(email) ? "ADMIN" : undefined;

    if (oauthAccount) {
      const updateInput = {
        userId: oauthAccount.userId,
        email,
      };

      if (adminRole) {
        return repository.updateUserAfterLogin(
          { ...updateInput, role: adminRole },
          now
        );
      }

      return repository.updateUserAfterLogin(updateInput, now);
    }

    return repository.createUserWithOAuthAccount(
      {
        email,
        displayName: verifiedUser.name,
        role: adminRole ?? "USER",
        provider: verifiedUser.provider,
        providerUserId: verifiedUser.providerAccountId,
        providerEmail: email,
      },
      now
    );
  }

  // 기능 : 기기 슬롯의 기존 등록 상태를 확인하고 기기 생성, 갱신, 교체를 처리합니다.
  private async resolveDevice(
    repository: AuthRepository,
    input: {
      readonly user: AuthUserRecord;
      readonly slot: AuthDeviceSlot;
      readonly deviceId: string;
      readonly deviceLabel: string | null;
      readonly replaceExistingDevice: boolean;
      readonly now: Date;
    }
  ): Promise<AuthDeviceRecord> {
    const deviceIdHash = this.secureTokenService.hash(`device:${input.deviceId}`);
    const activeDevice = await repository.findActiveDeviceBySlot(
      input.user.id,
      input.slot
    );

    if (!activeDevice) {
      return repository.createAuthDevice({
        userId: input.user.id,
        slot: input.slot,
        deviceIdHash,
        label: input.deviceLabel,
        now: input.now,
      });
    }

    if (activeDevice.deviceIdHash === deviceIdHash) {
      return repository.updateAuthDeviceSeen(
        activeDevice.id,
        input.deviceLabel,
        input.now
      );
    }

    if (!input.replaceExistingDevice) {
      throw new DeviceSlotAlreadyRegisteredError();
    }

    await repository.replaceAuthDevice(activeDevice.id, input.now);
    await repository.revokeActiveSessionsByDevice(activeDevice.id, input.now);

    return repository.createAuthDevice({
      userId: input.user.id,
      slot: input.slot,
      deviceIdHash,
      label: input.deviceLabel,
      now: input.now,
    });
  }

  // 기능 : 요청 문자열을 인증 기기 슬롯 값으로 검증해 변환합니다.
  private parseDeviceSlot(value: string): AuthDeviceSlot {
    if (
      value === "mobile" ||
      value === "personal_laptop" ||
      value === "work_laptop"
    ) {
      return value;
    }

    throw new InvalidDeviceSlotError();
  }

  // 기능 : 기기 식별자의 길이 유효성을 검증합니다.
  private assertDeviceId(deviceId: string): void {
    const trimmed = deviceId.trim();

    if (trimmed.length < 8 || trimmed.length > 200) {
      throw new InvalidDeviceIdError();
    }
  }

  // 기능 : 이메일을 소문자 표준 형식으로 정규화하고 빈 값을 차단합니다.
  private normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new ExternalUserEmailMissingError();
    }

    return normalized;
  }

  // 기능 : 사용자 상태가 로그인 가능한 활성 상태인지 검증합니다.
  private assertActiveUser(user: AuthUserRecord): void {
    if (user.status !== "ACTIVE" || user.deletedAt) {
      throw new InactiveUserError();
    }
  }

  // 기능 : 저장용 refresh token 해시 값을 생성합니다.
  private hashRefreshToken(refreshToken: string): string {
    return this.secureTokenService.hash(`refresh:${refreshToken}`);
  }

  // 기능 : 초기 관리자 이메일 목록에 포함되는지 확인합니다.
  private isInitialAdminEmail(email: string): boolean {
    return this.getInitialAdminEmails().includes(email);
  }

  // 기능 : 환경 변수에서 초기 관리자 이메일 목록을 읽어 정규화합니다.
  private getInitialAdminEmails(): string[] {
    const value = this.configService.get<string>("INITIAL_ADMIN_EMAILS") ?? "";

    return value
      .split(",")
      // 기능 : 관리자 이메일 항목의 공백을 제거하고 소문자로 통일합니다.
      .map((item) => item.trim().toLowerCase())
      // 기능 : 빈 관리자 이메일 항목을 제외합니다.
      .filter((item) => item.length > 0);
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

