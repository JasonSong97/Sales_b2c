import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserDeviceRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : ListMyDevicesUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class ListMyDevicesUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 활성 등록 기기 목록과 현재 기기 여부를 조회합니다.
  async execute(currentUser: CurrentUserContext): Promise<{
    readonly devices: UserDeviceRecord[];
  }> {
    // 1. 현재 사용자와 현재 세션 기준으로 활성 등록 기기 목록을 조회한다.
    return {
      devices: await this.userRepository.listActiveDevices(
        currentUser.id,
        currentUser.sessionId,
        new Date()
      ),
    };
  }
}
