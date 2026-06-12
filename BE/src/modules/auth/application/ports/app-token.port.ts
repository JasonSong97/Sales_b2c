export const APP_TOKEN_ISSUER = Symbol("APP_TOKEN_ISSUER");

// 역할 : AppAccessTokenPayload 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AppAccessTokenPayload {
  readonly userId: string;
  readonly sessionId: string;
}

// 역할 : IssuedAppAccessToken 인터페이스가 구현해야 하는 계약을 정의합니다.
export interface IssuedAppAccessToken {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
}

// 역할 : AppTokenIssuer 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface AppTokenIssuer {
  // 기능 : 앱 access token을 발급하고 만료 시각을 반환합니다.
  issueAccessToken(payload: AppAccessTokenPayload): Promise<IssuedAppAccessToken>;
  // 기능 : 앱 access token을 검증하고 payload를 반환합니다.
  verifyAccessToken(accessToken: string): Promise<AppAccessTokenPayload>;
}

