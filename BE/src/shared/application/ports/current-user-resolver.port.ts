import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

export const CURRENT_USER_RESOLVER = Symbol("CURRENT_USER_RESOLVER");

// 역할 : CurrentUserResolver 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface CurrentUserResolver {
  // 기능 : 앱 access token에서 현재 사용자 컨텍스트를 해석합니다.
  resolveFromAccessToken(accessToken: string): Promise<CurrentUserContext>;
}

