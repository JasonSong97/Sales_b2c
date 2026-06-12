import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : GetMyProfileUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class GetMyProfileUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 활성 프로필 정보를 조회합니다.
  async execute(currentUser: CurrentUserContext): Promise<UserProfileRecord> {
    // 1. 현재 사용자 ID로 프로필과 OAuth 연결 정보를 조회한다.
    const profile = await this.userRepository.getProfile(currentUser.id);

    // 2. 사용자 존재 여부와 활성 상태를 검증한다.
    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    // 3. 설정 화면용 프로필 응답 레코드를 반환한다.
    return profile;
  }
}
