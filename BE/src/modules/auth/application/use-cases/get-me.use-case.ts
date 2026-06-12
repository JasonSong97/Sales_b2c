import { Inject, Injectable } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  type AuthMeRecord,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : GetMeUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class GetMeUseCase {
  // 기능 : 인증 저장소를 주입받습니다.
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  // 기능 : 현재 사용자 ID로 활성 사용자 내 정보를 조회합니다.
  async execute(currentUser: CurrentUserContext): Promise<AuthMeRecord> {
    // 1. 현재 사용자 ID로 인증 사용자 정보를 조회한다.
    const me = await this.authRepository.getMe(currentUser.id);

    // 2. 사용자 존재 여부와 활성 상태를 검증한다.
    if (!me || me.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    // 3. 현재 사용자 응답 레코드를 반환한다.
    return me;
  }
}

