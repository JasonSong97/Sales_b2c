import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetMeUseCase } from "@/modules/auth/application/use-cases/get-me.use-case";
import {
  toAdminMeResponse,
  toMeResponse,
} from "@/modules/auth/application/auth-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

@Controller("api/me")
export class MeController {
  // 기능 : 사용자 내 정보 조회 유스케이스를 주입받습니다.
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @UseGuards(AuthGuard)
  @Get()
  // 기능 : 사용자 웹용 현재 사용자 정보를 반환합니다.
  async getMe(@CurrentUser() currentUser: CurrentUserContext) {
    return toMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

@Controller("admin/api/me")
export class AdminMeController {
  // 기능 : 관리자 내 정보 조회 유스케이스를 주입받습니다.
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  // 기능 : 관리자 웹용 현재 관리자 정보를 반환합니다.
  async getAdminMe(@CurrentUser() currentUser: CurrentUserContext) {
    return toAdminMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

