export class DomainError extends Error {
  // 기능 : 도메인 오류 코드, 메시지, 상세 정보를 표준 Error 인스턴스로 초기화합니다.
  constructor(
    readonly code: string,
    message: string,
    readonly details: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = new.target.name;
  }
}

