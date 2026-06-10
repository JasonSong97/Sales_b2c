import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { GetMyProfileUseCase } from "@/modules/user/application/use-cases/get-my-profile.use-case";
import { ListMyDevicesUseCase } from "@/modules/user/application/use-cases/list-my-devices.use-case";
import { UpdateMyProfileUseCase } from "@/modules/user/application/use-cases/update-my-profile.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";

@UseGuards(AuthGuard)
@Controller("api/users/me")
export class UserMeController {
  // 기능 : 내 정보와 등록 기기 조회/수정 유스케이스를 주입받습니다.
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly listMyDevicesUseCase: ListMyDevicesUseCase
  ) {}

  @Get("profile")
  // 기능 : 현재 사용자의 개인 정보를 조회합니다.
  getProfile(@CurrentUser() currentUser: CurrentUserContext) {
    return this.getMyProfileUseCase.execute(currentUser);
  }

  @Patch("profile")
  // 기능 : 현재 사용자의 개인 정보 수정 요청을 처리합니다.
  updateProfile(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateMyProfileDto
  ) {
    return this.updateMyProfileUseCase.execute(currentUser, body);
  }

  @Get("devices")
  // 기능 : 현재 사용자의 활성 등록 기기 목록을 조회합니다.
  listDevices(@CurrentUser() currentUser: CurrentUserContext) {
    return this.listMyDevicesUseCase.execute(currentUser);
  }
}

