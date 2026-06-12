export const PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT = Symbol(
  "PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT"
);

// 역할 : EncryptedProductPrivateMemo 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface EncryptedProductPrivateMemo {
  readonly ciphertext: string;
  readonly keyVersion: string;
}

// 역할 : ProductPrivateMemoEncryptionPort 제품 개인 비밀 메모 암호화 계약을 정의합니다.
export interface ProductPrivateMemoEncryptionPort {
  // 기능 : 제품 개인 비밀 메모 평문을 암호문과 key version으로 변환합니다.
  encrypt(plaintext: string): EncryptedProductPrivateMemo;
  // 기능 : 제품 개인 비밀 메모 암호문을 평문으로 복호화합니다.
  decrypt(ciphertext: string, keyVersion: string): string;
}
