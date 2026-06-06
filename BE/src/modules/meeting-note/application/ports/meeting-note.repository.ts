import type {
  DeleteResultRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export type {
  DeleteResultRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export const MEETING_NOTE_REPOSITORY = Symbol("MEETING_NOTE_REPOSITORY");

export interface GeneratedMeetingNoteFields {
  readonly meetingDate: Date | null;
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly productName: string | null;
  readonly stageText: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
}

export interface MeetingNoteRecord extends GeneratedMeetingNoteFields {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string | null;
  readonly dealTitle: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface MeetingNoteDetailRecord {
  readonly meetingNote: MeetingNoteRecord;
  readonly deal: { readonly id: string; readonly title: string } | null;
  readonly rawText: string;
}

export interface AiJobRecord {
  readonly id: string;
}

export interface ListMeetingNotesInput extends PaginationInput {
  readonly userId: string;
  readonly dealId: string | null;
  readonly search: string | null;
  readonly includeDeleted: boolean;
}

export interface CreateMeetingNoteInput extends GeneratedMeetingNoteFields {
  readonly userId: string;
  readonly rawText: string;
  readonly dealId: string | null;
}

export interface UpdateMeetingNoteInput {
  readonly userId: string;
  readonly meetingNoteId: string;
  readonly rawText?: string;
  readonly meetingDate?: Date | null;
  readonly companyName?: string | null;
  readonly contactName?: string | null;
  readonly department?: string | null;
  readonly productName?: string | null;
  readonly stageText?: string | null;
  readonly details?: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly dealId?: string | null;
}

export interface LinkMeetingNoteToDealInput {
  readonly userId: string;
  readonly meetingNoteId: string;
  readonly dealId: string;
  readonly activityTitle: string | null;
}

export interface CreateAiJobInput {
  readonly userId: string;
  readonly rawText: string;
}

export interface CompleteAiJobInput {
  readonly userId: string;
  readonly aiJobId: string;
  readonly output: GeneratedMeetingNoteFields;
}

export interface FailAiJobInput {
  readonly userId: string;
  readonly aiJobId: string;
  readonly errorMessage: string;
}

export interface MeetingNoteRepository {
  listMeetingNotes(
    input: ListMeetingNotesInput
  ): Promise<PaginatedResult<MeetingNoteRecord>>;
  createMeetingNote(input: CreateMeetingNoteInput): Promise<MeetingNoteRecord>;
  getMeetingNoteDetail(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteDetailRecord | null>;
  updateMeetingNote(input: UpdateMeetingNoteInput): Promise<MeetingNoteRecord>;
  linkMeetingNoteToDeal(
    input: LinkMeetingNoteToDealInput
  ): Promise<MeetingNoteRecord>;
  deleteMeetingNote(
    userId: string,
    meetingNoteId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  restoreMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord>;
  createAiJob(input: CreateAiJobInput): Promise<AiJobRecord>;
  completeAiJob(input: CompleteAiJobInput): Promise<void>;
  failAiJob(input: FailAiJobInput): Promise<void>;
}
