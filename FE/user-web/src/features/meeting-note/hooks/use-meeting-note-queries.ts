import { useQuery } from "@tanstack/react-query";
import {
  getMeetingNote,
  listMeetingNotes,
} from "@/features/meeting-note/api/meeting-note-api";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import type { MeetingNoteListParams } from "@/features/meeting-note/types/meeting-note";

export function useMeetingNoteList(params: MeetingNoteListParams) {
  return useQuery({
    queryKey: meetingNoteQueryKeys.list(params),
    queryFn: () => listMeetingNotes(params),
  });
}

export function useMeetingNoteDetail(
  meetingNoteId: string,
  enabled = true
) {
  return useQuery({
    enabled: enabled && meetingNoteId.length > 0,
    queryKey: meetingNoteQueryKeys.detail(meetingNoteId),
    queryFn: () => getMeetingNote(meetingNoteId),
  });
}
