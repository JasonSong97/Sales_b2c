import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  CURRENT_USER_RESOLVER,
  type CurrentUserResolver,
} from "@/shared/application/ports/current-user-resolver.port";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

// 역할 : AuthGuard 요청의 인증 또는 권한 접근 조건을 검증합니다.
@Injectable()
export class AuthGuard implements CanActivate {
  // 기능 : access token에서 현재 사용자를 해석할 resolver를 주입받습니다.
  constructor(
    @Inject(CURRENT_USER_RESOLVER)
    private readonly currentUserResolver: CurrentUserResolver
  ) {}

  // 기능 : 요청의 Bearer 토큰을 검증하고 currentUser를 요청 객체에 저장합니다.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    const accessToken = this.getBearerToken(request);
    request.currentUser =
      await this.currentUserResolver.resolveFromAccessToken(accessToken);

    return true;
  }

  // 기능 : 요청 Authorization 헤더에서 Bearer 토큰 값을 추출합니다.
  private getBearerToken(request: Request): string {
    const authorization = request.header("Authorization");

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

