import type { MeetingNoteListParams } from "@/features/meeting-note/types/meeting-note";

export const meetingNoteQueryKeys = {
  all: ["meeting-note"] as const,
  lists: () => [...meetingNoteQueryKeys.all, "list"] as const,
  list: (params: MeetingNoteListParams) =>
    [
      ...meetingNoteQueryKeys.lists(),
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        dealId: params.dealId ?? "",
        search: params.search ?? "",
        includeDeleted: params.includeDeleted ?? false,
      },
    ] as const,
  details: () => [...meetingNoteQueryKeys.all, "detail"] as const,
  detail: (meetingNoteId: string) =>
    [...meetingNoteQueryKeys.details(), meetingNoteId] as const,
};
