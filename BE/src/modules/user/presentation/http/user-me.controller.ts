import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { GetMyProfileUseCase } from "@/modules/user/application/use-cases/get-my-profile.use-case";
import { ListMyDevicesUseCase } from "@/modules/user/application/use-cases/list-my-devices.use-case";
import { UpdateMyProfileUseCase } from "@/modules/user/application/use-cases/update-my-profile.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";

// 역할 : UserMeController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me")
export class UserMeController {
  // 기능 : 내 정보와 등록 기기 조회/수정 유스케이스를 주입받습니다.
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly listMyDevicesUseCase: ListMyDevicesUseCase
  ) {}

  // API : 사용자, 내 개인 정보 조회
  @Get("profile")
  getProfile(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. application 계층에 현재 사용자 프로필 조회를 위임한다.
    return this.getMyProfileUseCase.execute(currentUser);
  }

  // API : 사용자, 내 개인 정보 수정
  @Patch("profile")
  updateProfile(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateMyProfileDto
  ) {
    // 1. request body를 application 계층 입력으로 전달한다.
    return this.updateMyProfileUseCase.execute(currentUser, body);
  }

  // API : 사용자, 내 등록 기기 목록 조회
  @Get("devices")
  listDevices(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. application 계층에 활성 등록 기기 조회를 위임한다.
    return this.listMyDevicesUseCase.execute(currentUser);
  }
}

