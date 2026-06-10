import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ExchangeExternalAuthTokenUseCase } from "@/modules/auth/application/use-cases/exchange-external-auth-token.use-case";
import { ListAuthProvidersUseCase } from "@/modules/auth/application/use-cases/list-auth-providers.use-case";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout.use-case";
import { RefreshAppTokenUseCase } from "@/modules/auth/application/use-cases/refresh-app-token.use-case";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthCookieService } from "./auth-cookie.service";
import { ExchangeExternalAuthTokenDto } from "./dto/exchange-external-auth-token.dto";

@Controller("api/auth")
export class AuthController {
  // 기능 : 인증 API에 필요한 유스케이스와 쿠키 서비스를 주입받습니다.
  constructor(
    private readonly listAuthProvidersUseCase: ListAuthProvidersUseCase,
    private readonly exchangeExternalAuthTokenUseCase: ExchangeExternalAuthTokenUseCase,
    private readonly refreshAppTokenUseCase: RefreshAppTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly authCookieService: AuthCookieService
  ) {}

  @Get("providers")
  // 기능 : 클라이언트가 사용할 수 있는 인증 제공자 목록을 반환합니다.
  listProviders() {
    return this.listAuthProvidersUseCase.execute();
  }

  @Post("exchange")
  // 기능 : 외부 인증 토큰을 앱 세션으로 교환하고 refresh token 쿠키를 설정합니다.
  async exchange(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: ExchangeExternalAuthTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.exchangeExternalAuthTokenUseCase.execute({
      supabaseAccessToken: this.getBearerToken(authorization),
      deviceSlot: body.deviceSlot,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel ?? null,
      replaceExistingDevice: body.replaceExistingDevice ?? false,
      userAgent: request.header("User-Agent") ?? null,
      ipAddress: request.ip ?? null,
    });

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return result.response;
  }

  @Post("refresh")
  // 기능 : refresh token 쿠키로 앱 토큰을 재발급하고 쿠키를 회전합니다.
  async refresh(
    @Headers("origin") origin: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = this.authCookieService.readRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const result = await this.refreshAppTokenUseCase.execute({
      refreshToken,
      origin: origin ?? null,
    });

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return result.response;
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  // 기능 : 현재 인증 세션을 폐기하고 refresh token 쿠키를 삭제합니다.
  async logout(
    @CurrentUser() currentUser: CurrentUserContext,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.logoutUseCase.execute(currentUser);
    this.authCookieService.clearRefreshToken(response);

    return result;
  }

  // 기능 : Authorization 헤더에서 Bearer 토큰 값을 추출하고 형식을 검증합니다.
  private getBearerToken(authorization: string | undefined): string {
    if (!authorization) {
      throw new UnauthorizedException("Missing Authorization header");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid Authorization header");
    }

    return token;
  }
}

