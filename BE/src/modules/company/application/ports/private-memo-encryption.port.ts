export const PRIVATE_MEMO_ENCRYPTION_PORT = Symbol(
  "PRIVATE_MEMO_ENCRYPTION_PORT"
);

// 역할 : EncryptedPrivateMemo 인터페이스가 구현해야 하는 계약을 정의합니다.
export interface EncryptedPrivateMemo {
  readonly ciphertext: string;
  readonly keyVersion: string;
}

// 역할 : PrivateMemoEncryptionPort 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface PrivateMemoEncryptionPort {
  // 기능 : 개인 비밀 메모 평문을 저장용 암호문과 key version으로 변환합니다.
  encrypt(plaintext: string): EncryptedPrivateMemo;
  // 기능 : 저장된 암호문과 key version으로 개인 비밀 메모 평문을 복호화합니다.
  decrypt(ciphertext: string, keyVersion: string): string;
}
