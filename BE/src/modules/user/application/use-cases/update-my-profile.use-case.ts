import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UpdateUserProfileInput,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class UpdateMyProfileUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 프로필 수정 값을 저장하고 갱신된 프로필을 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord> {
    const profile = await this.userRepository.updateProfile(currentUser.id, {
      name: this.normalizeName(input.name),
    });

    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return profile;
  }

  // 기능 : 이름 입력값을 저장 가능한 공백 제거 값 또는 null로 정규화합니다.
  private normalizeName(name: string | null | undefined): string | null | undefined {
    if (name === undefined) {
      return undefined;
    }

    if (name === null) {
      return null;
    }

    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
