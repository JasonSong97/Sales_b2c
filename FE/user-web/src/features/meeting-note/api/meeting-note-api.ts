import type {
  CreateMeetingNoteInput,
  DeleteMeetingNoteResponse,
  GenerateMeetingNoteInput,
  GeneratedMeetingNote,
  LinkMeetingNoteToDealInput,
  MeetingNote,
  MeetingNoteDetail,
  MeetingNoteListParams,
  MeetingNoteListResponse,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";
import { apiClient } from "@/lib/api-client";

export function listMeetingNotes(params: MeetingNoteListParams) {
  const query = toMeetingNoteListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<MeetingNoteListResponse>(`/api/meeting-notes${suffix}`);
}

export function generateMeetingNote(input: GenerateMeetingNoteInput) {
  return apiClient<GeneratedMeetingNote>("/api/meeting-notes/generate", {
    method: "POST",
    body: compactBody(input),
  });
}

export function createMeetingNote(input: CreateMeetingNoteInput) {
  return apiClient<MeetingNote>("/api/meeting-notes", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getMeetingNote(meetingNoteId: string) {
  return apiClient<MeetingNoteDetail>(`/api/meeting-notes/${meetingNoteId}`);
}

export function updateMeetingNote(input: UpdateMeetingNoteInput) {
  return apiClient<MeetingNote>(`/api/meeting-notes/${input.meetingNoteId}`, {
    method: "PATCH",
    body: compactBody({
      rawText: input.rawText,
      meetingDate: input.meetingDate,
      companyName: input.companyName,
      contactName: input.contactName,
      department: input.department,
      productName: input.productName,
      stageText: input.stageText,
      details: input.details,
      nextPlan: input.nextPlan,
      requiredAction: input.requiredAction,
      dealId: input.dealId,
    }),
  });
}

export function linkMeetingNoteToDeal(input: LinkMeetingNoteToDealInput) {
  return apiClient<MeetingNote>(
    `/api/meeting-notes/${input.meetingNoteId}/link-deal`,
    {
      method: "POST",
      body: compactBody({
        dealId: input.dealId,
        activityTitle: input.activityTitle,
      }),
    }
  );
}

export function deleteMeetingNote(meetingNoteId: string) {
  return apiClient<DeleteMeetingNoteResponse>(
    `/api/meeting-notes/${meetingNoteId}`,
    {
      method: "DELETE",
    }
  );
}

function toMeetingNoteListSearchParams(params: MeetingNoteListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.dealId) {
    searchParams.set("dealId", params.dealId);
  }

  if (params.search) {
    searchParams.set("search", params.search);
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
