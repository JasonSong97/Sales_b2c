import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeetingNote,
  deleteMeetingNote,
  generateMeetingNote,
  linkMeetingNoteToDeal,
  updateMeetingNote,
} from "@/features/meeting-note/api/meeting-note-api";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import type {
  CreateMeetingNoteInput,
  GenerateMeetingNoteInput,
  LinkMeetingNoteToDealInput,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";

export function useGenerateMeetingNoteMutation() {
  return useMutation({
    mutationFn: (input: GenerateMeetingNoteInput) => generateMeetingNote(input),
  });
}

export function useCreateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingNoteInput) => createMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

export function useUpdateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMeetingNoteInput) => updateMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

export function useLinkMeetingNoteToDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LinkMeetingNoteToDealInput) =>
      linkMeetingNoteToDeal(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);

      if (meetingNote.dealId) {
        void queryClient.invalidateQueries({
          queryKey: ["deal"],
        });
      }
    },
  });
}

export function useDeleteMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingNoteId: string) => deleteMeetingNote(meetingNoteId),
    onSuccess: (result) => {
      invalidateMeetingNoteQueries(queryClient, result.id);
    },
  });
}

function invalidateMeetingNoteQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  meetingNoteId: string
) {
  void queryClient.invalidateQueries({ queryKey: meetingNoteQueryKeys.lists() });
  void queryClient.invalidateQueries({
    queryKey: meetingNoteQueryKeys.detail(meetingNoteId),
  });
}
