export const TRANSACTION_MANAGER = Symbol("TRANSACTION_MANAGER");

export interface TransactionManager {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
