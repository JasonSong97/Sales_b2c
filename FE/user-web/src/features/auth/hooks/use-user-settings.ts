import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  listMyDevices,
  updateMyProfile,
} from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import type { UpdateUserProfileInput } from "@/features/auth/types/auth";

export function useMyProfile() {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getMyProfile,
  });
}

export function useMyDevices() {
  return useQuery({
    queryKey: authQueryKeys.devices(),
    queryFn: listMyDevices,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateMyProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    },
  });
}
