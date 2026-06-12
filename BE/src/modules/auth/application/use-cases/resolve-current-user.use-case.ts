import { Inject, Injectable } from "@nestjs/common";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";

// 역할 : ResolveCurrentUserUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class ResolveCurrentUserUseCase {
  // 기능 : 앱 토큰 발급기와 인증 저장소를 주입받습니다.
  constructor(
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  // 기능 : access token을 검증하고 활성 세션의 현재 사용자 컨텍스트를 반환합니다.
  async resolveFromAccessToken(accessToken: string): Promise<CurrentUserContext> {
    // 1. 앱 access token의 서명과 payload를 검증한다.
    const payload = await this.appTokenIssuer.verifyAccessToken(accessToken);

    // 2. token payload의 sessionId로 세션과 사용자 정보를 조회한다.
    const record = await this.authRepository.findSessionByIdWithUser(
      payload.sessionId
    );

    // 3. 세션 존재 여부와 token 사용자 일치 여부를 검증한다.
    if (!record || record.session.userId !== payload.userId) {
      throw new UnauthorizedError("Invalid session");
    }

    // 4. 세션 활성 상태와 만료 여부를 검증한다.
    if (
      record.session.status !== "ACTIVE" ||
      record.session.revokedAt ||
      record.session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedError("Expired session");
    }

    if (record.user.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    // 5. guard와 controller가 사용할 현재 사용자 컨텍스트를 반환한다.
    return record.user;
  }
}

