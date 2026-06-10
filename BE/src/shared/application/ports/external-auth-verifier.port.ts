export const EXTERNAL_AUTH_VERIFIER = Symbol("EXTERNAL_AUTH_VERIFIER");

export type ExternalAuthProvider = "kakao" | "naver" | "google" | "apple";

export interface VerifiedExternalUser {
  provider: ExternalAuthProvider;
  providerAccountId: string;
  authUserId: string;
  email: string;
  name: string | null;
}

export interface ExternalAuthVerifier {
  // 기능 : 외부 인증 access token을 검증하고 외부 사용자 정보를 반환합니다.
  verifyAccessToken(accessToken: string): Promise<VerifiedExternalUser>;
}
