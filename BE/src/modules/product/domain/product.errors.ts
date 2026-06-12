import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ProductNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductNotFoundError extends DomainError {
  // 기능 : 제품이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ProductNotFound", "Product was not found");
  }
}

// 역할 : ProductCategoryNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductCategoryNotFoundError extends DomainError {
  // 기능 : 제품 카테고리가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ProductCategoryNotFound", "Product category was not found");
  }
}

// 역할 : ProductStatusNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductStatusNotFoundError extends DomainError {
  // 기능 : 제품 상태가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ProductStatusNotFound", "Product status was not found");
  }
}

// 역할 : DuplicateProductCategoryError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateProductCategoryError extends DomainError {
  // 기능 : 같은 사용자 안에서 제품 카테고리 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateProductCategory", "Product category already exists");
  }
}

// 역할 : DuplicateProductStatusError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateProductStatusError extends DomainError {
  // 기능 : 같은 사용자 안에서 제품 상태 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateProductStatus", "Product status already exists");
  }
}

// 역할 : ProductCategoryInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductCategoryInUseError extends DomainError {
  // 기능 : 제품에 매핑된 카테고리 삭제 시도 오류를 생성합니다.
  constructor() {
    super("ProductCategoryInUse", "Product category is in use");
  }
}

// 역할 : ProductStatusInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductStatusInUseError extends DomainError {
  // 기능 : 제품에 매핑된 상태 삭제 시도 오류를 생성합니다.
  constructor() {
    super("ProductStatusInUse", "Product status is in use");
  }
}

// 역할 : ProductMemoLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductMemoLogNotFoundError extends DomainError {
  // 기능 : 제품 일반 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super("ProductMemoLogNotFound", "Product memo log was not found");
  }
}

// 역할 : ProductPrivateMemoLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductPrivateMemoLogNotFoundError extends DomainError {
  // 기능 : 제품 개인 비밀 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super(
      "ProductPrivateMemoLogNotFound",
      "Product private memo log was not found"
    );
  }
}

// 역할 : ProductExportFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductExportFailedError extends DomainError {
  // 기능 : 제품 xlsx export 파일 생성 실패 오류를 생성합니다.
  constructor() {
    super("ProductExportFailed", "Product export failed");
  }
}

// 역할 : ProductPrivateMemoEncryptFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductPrivateMemoEncryptFailedError extends DomainError {
  // 기능 : 제품 개인 비밀 메모 암호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoEncryptFailed", "Private memo encryption failed");
  }
}

// 역할 : ProductPrivateMemoDecryptFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ProductPrivateMemoDecryptFailedError extends DomainError {
  // 기능 : 제품 개인 비밀 메모 복호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoDecryptFailed", "Private memo decryption failed");
  }
}
