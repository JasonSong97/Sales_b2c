import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeDealStage,
  completeDealNextAction,
  createDeal,
  createDealActivity,
  snoozeDealNextAction,
  updateDealNextAction,
} from "@/features/deal/api/deal-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import type {
  ChangeDealStageInput,
  CompleteDealNextActionInput,
  CreateDealActivityInput,
  CreateDealInput,
  SnoozeDealNextActionInput,
  UpdateDealNextActionInput,
} from "@/features/deal/types/deal";

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealInput) => createDeal(input),
    onSuccess: (deal) => {
      invalidateDealQueries(queryClient, deal.id);
    },
  });
}

export function useChangeDealStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeDealStageInput) => changeDealStage(input),
    onSuccess: (deal) => {
      invalidateDealQueries(queryClient, deal.id);
    },
  });
}

export function useUpdateDealNextActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDealNextActionInput) =>
      updateDealNextAction(input),
    onSuccess: (deal) => {
      invalidateDealQueries(queryClient, deal.id);
    },
  });
}

export function useCompleteDealNextActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteDealNextActionInput) =>
      completeDealNextAction(input),
    onSuccess: (deal) => {
      invalidateDealQueries(queryClient, deal.id);
    },
  });
}

export function useSnoozeDealNextActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SnoozeDealNextActionInput) =>
      snoozeDealNextAction(input),
    onSuccess: (deal) => {
      invalidateDealQueries(queryClient, deal.id);
    },
  });
}

export function useCreateDealActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealActivityInput) => createDealActivity(input),
    onSuccess: (activity) => {
      invalidateDealQueries(queryClient, activity.dealId);
    },
  });
}

function invalidateDealQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  dealId: string
) {
  void queryClient.invalidateQueries({ queryKey: dealQueryKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: dealQueryKeys.detail(dealId) });
}
