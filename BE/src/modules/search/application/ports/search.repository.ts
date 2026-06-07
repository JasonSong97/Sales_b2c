export const SEARCH_REPOSITORY = Symbol("SEARCH_REPOSITORY");

export type SearchTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE";

export interface SearchItemRecord {
  readonly title: string;
  readonly subtitle: string | null;
  readonly targetId: string;
  readonly targetPath: string | null;
}

export interface SearchGroupRecord {
  readonly type: SearchTargetType;
  readonly items: readonly SearchItemRecord[];
}

export interface SearchAllInput {
  readonly userId: string;
  readonly q: string;
  readonly types: readonly SearchTargetType[];
  readonly limit: number;
}

export interface SearchAllResult {
  readonly groups: readonly SearchGroupRecord[];
}

export interface SearchRepository {
  searchAll(input: SearchAllInput): Promise<SearchAllResult>;
}
