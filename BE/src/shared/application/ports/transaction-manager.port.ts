export const TRANSACTION_MANAGER = Symbol("TRANSACTION_MANAGER");

// 역할 : TransactionManager 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface TransactionManager {
  // 기능 : 전달받은 비동기 작업을 트랜잭션 안에서 실행합니다.
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
