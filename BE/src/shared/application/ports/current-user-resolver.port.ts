import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

export const CURRENT_USER_RESOLVER = Symbol("CURRENT_USER_RESOLVER");

export interface CurrentUserResolver {
  // 기능 : 앱 access token에서 현재 사용자 컨텍스트를 해석합니다.
  resolveFromAccessToken(accessToken: string): Promise<CurrentUserContext>;
}

