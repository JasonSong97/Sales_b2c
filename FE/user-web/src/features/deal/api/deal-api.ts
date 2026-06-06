import type {
  ChangeDealStageInput,
  CompleteDealNextActionInput,
  CreateDealActivityInput,
  CreateDealInput,
  Deal,
  DealActivity,
  DealActivityListParams,
  DealActivityListResponse,
  DealDetail,
  DealListParams,
  DealListResponse,
  SnoozeDealNextActionInput,
  UpdateDealNextActionInput,
} from "@/features/deal/types/deal";
import { apiClient } from "@/lib/api-client";

export function listDeals(params: DealListParams) {
  const query = toDealListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<DealListResponse>(`/api/deals${suffix}`);
}

export function createDeal(input: CreateDealInput) {
  return apiClient<Deal>("/api/deals", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getDeal(dealId: string) {
  return apiClient<DealDetail>(`/api/deals/${dealId}`);
}

export function changeDealStage(input: ChangeDealStageInput) {
  return apiClient<Deal>(`/api/deals/${input.dealId}/stage`, {
    method: "PATCH",
    body: compactBody({
      stage: input.stage,
      activityTitle: input.activityTitle,
      activityContent: input.activityContent,
    }),
  });
}

export function updateDealNextAction(input: UpdateDealNextActionInput) {
  return apiClient<Deal>(`/api/deals/${input.dealId}/next-action`, {
    method: "PATCH",
    body: compactBody({
      nextActionText: input.nextActionText,
      nextActionDueAt: input.nextActionDueAt,
      nextActionStatus: input.nextActionStatus,
    }),
  });
}

export function completeDealNextAction(input: CompleteDealNextActionInput) {
  return apiClient<Deal>(`/api/deals/${input.dealId}/next-action/complete`, {
    method: "POST",
    body: compactBody({
      completedAt: input.completedAt,
      activityContent: input.activityContent,
    }),
  });
}

export function snoozeDealNextAction(input: SnoozeDealNextActionInput) {
  return apiClient<Deal>(`/api/deals/${input.dealId}/next-action/snooze`, {
    method: "POST",
    body: compactBody({
      nextActionDueAt: input.nextActionDueAt,
      reason: input.reason,
    }),
  });
}

export function listDealActivities(
  dealId: string,
  params: DealActivityListParams
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return apiClient<DealActivityListResponse>(
    `/api/deals/${dealId}/activities?${query.toString()}`
  );
}

export function createDealActivity(input: CreateDealActivityInput) {
  return apiClient<DealActivity>(`/api/deals/${input.dealId}/activities`, {
    method: "POST",
    body: compactBody({
      typeId: input.typeId,
      occurredAt: input.occurredAt,
      title: input.title,
      content: input.content,
    }),
  });
}

function toDealListSearchParams(params: DealListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.stage) {
    searchParams.set("stage", params.stage);
  }

  if (params.likelihoodStatus) {
    searchParams.set("likelihoodStatus", params.likelihoodStatus);
  }

  if (params.nextActionStatus) {
    searchParams.set("nextActionStatus", params.nextActionStatus);
  }

  if (params.companyId) {
    searchParams.set("companyId", params.companyId);
  }

  if (params.contactId) {
    searchParams.set("contactId", params.contactId);
  }

  if (params.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
