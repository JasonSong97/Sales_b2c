import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

@Injectable()
export class AdminGuard implements CanActivate {
  // 기능 : 현재 사용자 컨텍스트가 관리자 권한인지 검증합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();

    if (!request.currentUser || request.currentUser.role !== "ADMIN") {
      throw new ForbiddenException("Admin role required");
    }

    return true;
  }
}

