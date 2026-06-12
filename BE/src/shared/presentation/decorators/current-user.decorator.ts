import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

export const CurrentUser = createParamDecorator(
  // 기능 : 요청 객체에서 인증된 현재 사용자 컨텍스트를 꺼냅니다.
  (_data: unknown, context: ExecutionContext): CurrentUserContext => {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();

    if (!request.currentUser) {
      throw new Error("Current user is not available on request");
    }

    return request.currentUser;
  }
);

