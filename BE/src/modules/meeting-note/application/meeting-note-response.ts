import type {
  DeleteResultRecord,
  GeneratedMeetingNoteFields,
  MeetingNoteDetailRecord,
  MeetingNoteRecord,
  PaginatedResult,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";

export interface GeneratedMeetingNoteResponse {
  readonly aiJobId: string;
  readonly meetingDate: string | null;
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly productName: string | null;
  readonly stageText: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly candidates: {
    readonly deals: readonly unknown[];
    readonly companies: readonly unknown[];
    readonly contacts: readonly unknown[];
  };
}

export interface MeetingNoteResponse {
  readonly id: string;
  readonly meetingDate: string | null;
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly productName: string | null;
  readonly stageText: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly dealId: string | null;
  readonly dealTitle: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface MeetingNoteDetailResponse {
  readonly meetingNote: MeetingNoteResponse;
  readonly deal: { readonly id: string; readonly title: string } | null;
  readonly rawText: string;
}

export interface MeetingNoteListResponse {
  readonly items: MeetingNoteResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface DeleteMeetingNoteResponse {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export function toGeneratedMeetingNoteResponse(
  aiJobId: string,
  fields: GeneratedMeetingNoteFields
): GeneratedMeetingNoteResponse {
  return {
    aiJobId,
    ...toGeneratedFieldsResponse(fields),
    candidates: {
      deals: [],
      companies: [],
      contacts: [],
    },
  };
}

export function toMeetingNoteResponse(
  meetingNote: MeetingNoteRecord
): MeetingNoteResponse {
  return {
    id: meetingNote.id,
    ...toGeneratedFieldsResponse(meetingNote),
    dealId: meetingNote.dealId,
    dealTitle: meetingNote.dealTitle,
    createdAt: meetingNote.createdAt.toISOString(),
    updatedAt: meetingNote.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(meetingNote.deletedAt),
    permanentDeleteAt: toIsoOrNull(meetingNote.permanentDeleteAt),
  };
}

export function toMeetingNoteDetailResponse(
  detail: MeetingNoteDetailRecord
): MeetingNoteDetailResponse {
  return {
    meetingNote: toMeetingNoteResponse(detail.meetingNote),
    deal: detail.deal,
    rawText: detail.rawText,
  };
}

export function toMeetingNoteListResponse(
  result: PaginatedResult<MeetingNoteRecord>
): MeetingNoteListResponse {
  return {
    items: result.items.map(toMeetingNoteResponse),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    hasNext: result.hasNext,
  };
}

export function toDeleteMeetingNoteResponse(
  result: DeleteResultRecord
): DeleteMeetingNoteResponse {
  return {
    id: result.id,
    deletedAt: result.deletedAt.toISOString(),
    permanentDeleteAt: result.permanentDeleteAt.toISOString(),
  };
}

function toGeneratedFieldsResponse(fields: GeneratedMeetingNoteFields) {
  return {
    meetingDate: toIsoOrNull(fields.meetingDate),
    companyName: fields.companyName,
    contactName: fields.contactName,
    department: fields.department,
    productName: fields.productName,
    stageText: fields.stageText,
    details: fields.details,
    nextPlan: fields.nextPlan,
    requiredAction: fields.requiredAction,
  };
}

function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
