import { DomainError } from "./domain-error";

export class UnauthorizedError extends DomainError {
  // 기능 : 인증 실패 도메인 오류를 생성합니다.
  constructor(message = "Unauthorized") {
    super("Unauthorized", message);
  }
}

export class ForbiddenError extends DomainError {
  // 기능 : 권한 부족 도메인 오류를 생성합니다.
  constructor(message = "Forbidden") {
    super("Forbidden", message);
  }
}

export class ValidationDomainError extends DomainError {
  // 기능 : 입력 검증 실패 도메인 오류를 생성합니다.
  constructor(message = "Validation failed") {
    super("ValidationError", message);
  }
}

export class DeletedResourceError extends DomainError {
  // 기능 : 삭제된 리소스 접근 도메인 오류를 생성합니다.
  constructor(readonly operation: "read" | "write", message = "Deleted resource") {
    super("DeletedResource", message, { operation });
  }
}
