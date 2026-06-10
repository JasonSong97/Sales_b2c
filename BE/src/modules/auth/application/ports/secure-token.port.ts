export const SECURE_TOKEN_SERVICE = Symbol("SECURE_TOKEN_SERVICE");

export interface SecureTokenService {
  // 기능 : 예측 불가능한 보안 토큰 문자열을 생성합니다.
  createToken(): string;
  // 기능 : 토큰 또는 식별자를 저장용 해시 문자열로 변환합니다.
  hash(value: string): string;
}

