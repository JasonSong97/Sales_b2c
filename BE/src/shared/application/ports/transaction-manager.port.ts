export const TRANSACTION_MANAGER = Symbol("TRANSACTION_MANAGER");

export interface TransactionManager {
  // 기능 : 전달받은 비동기 작업을 트랜잭션 안에서 실행합니다.
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
