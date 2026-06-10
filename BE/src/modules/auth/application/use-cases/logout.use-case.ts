import { Inject, Injectable } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class LogoutUseCase {
  // 기능 : 인증 저장소를 주입받습니다.
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  // 기능 : 현재 세션을 폐기해 사용자를 로그아웃 처리합니다.
  async execute(currentUser: CurrentUserContext): Promise<{ success: true }> {
    await this.authRepository.revokeSession(currentUser.sessionId, new Date());

    return { success: true };
  }
}

