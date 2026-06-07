import type {
  SearchAllResult,
  SearchGroupRecord,
  SearchItemRecord,
} from "@/modules/search/application/ports/search.repository";

export interface SearchItemResponse {
  readonly title: string;
  readonly subtitle: string | null;
  readonly targetId: string;
  readonly targetPath: string | null;
}

export interface SearchGroupResponse {
  readonly type: string;
  readonly items: readonly SearchItemResponse[];
}

export interface SearchAllResponse {
  readonly groups: readonly SearchGroupResponse[];
}

export function toSearchAllResponse(result: SearchAllResult): SearchAllResponse {
  return {
    groups: result.groups.map(toSearchGroupResponse),
  };
}

function toSearchGroupResponse(group: SearchGroupRecord): SearchGroupResponse {
  return {
    type: group.type,
    items: group.items.map(toSearchItemResponse),
  };
}

function toSearchItemResponse(item: SearchItemRecord): SearchItemResponse {
  return {
    title: item.title,
    subtitle: item.subtitle,
    targetId: item.targetId,
    targetPath: item.targetPath,
  };
}
