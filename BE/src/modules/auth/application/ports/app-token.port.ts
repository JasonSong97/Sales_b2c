export const APP_TOKEN_ISSUER = Symbol("APP_TOKEN_ISSUER");

export interface AppAccessTokenPayload {
  readonly userId: string;
  readonly sessionId: string;
}

export interface IssuedAppAccessToken {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
}

export interface AppTokenIssuer {
  // 기능 : 앱 access token을 발급하고 만료 시각을 반환합니다.
  issueAccessToken(payload: AppAccessTokenPayload): Promise<IssuedAppAccessToken>;
  // 기능 : 앱 access token을 검증하고 payload를 반환합니다.
  verifyAccessToken(accessToken: string): Promise<AppAccessTokenPayload>;
}

