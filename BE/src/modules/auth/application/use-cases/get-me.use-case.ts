import { Inject, Injectable } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  type AuthMeRecord,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GetMeUseCase {
  // 기능 : 인증 저장소를 주입받습니다.
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  // 기능 : 현재 사용자 ID로 활성 사용자 내 정보를 조회합니다.
  async execute(currentUser: CurrentUserContext): Promise<AuthMeRecord> {
    const me = await this.authRepository.getMe(currentUser.id);

    if (!me || me.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return me;
  }
}

