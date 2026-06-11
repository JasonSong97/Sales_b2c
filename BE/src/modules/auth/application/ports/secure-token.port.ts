export const SECURE_TOKEN_SERVICE = Symbol("SECURE_TOKEN_SERVICE");

// 역할 : SecureTokenService 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface SecureTokenService {
  // 기능 : 예측 불가능한 보안 토큰 문자열을 생성합니다.
  createToken(): string;
  // 기능 : 토큰 또는 식별자를 저장용 해시 문자열로 변환합니다.
  hash(value: string): string;
}

