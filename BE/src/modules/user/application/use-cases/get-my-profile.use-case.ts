import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GetMyProfileUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 활성 프로필 정보를 조회합니다.
  async execute(currentUser: CurrentUserContext): Promise<UserProfileRecord> {
    const profile = await this.userRepository.getProfile(currentUser.id);

    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return profile;
  }
}
