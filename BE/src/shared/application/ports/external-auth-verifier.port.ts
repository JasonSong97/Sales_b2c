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
  verifyAccessToken(accessToken: string): Promise<VerifiedExternalUser>;
}
