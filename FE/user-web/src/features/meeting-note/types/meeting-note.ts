export type MeetingNote = {
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
};

export type GeneratedMeetingNote = {
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
};

export type MeetingNoteDetail = {
  readonly meetingNote: MeetingNote;
  readonly deal: { readonly id: string; readonly title: string } | null;
  readonly rawText: string;
};

export type MeetingNoteListResponse = {
  readonly items: MeetingNote[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
};

export type MeetingNoteListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly dealId?: string;
  readonly search?: string;
  readonly includeDeleted?: boolean;
};

export type GenerateMeetingNoteInput = {
  readonly rawText: string;
  readonly meetingDate?: string;
  readonly companyHint?: string;
  readonly contactHint?: string;
};

export type CreateMeetingNoteInput = {
  readonly rawText: string;
  readonly meetingDate: string;
  readonly companyName?: string;
  readonly contactName?: string;
  readonly department?: string;
  readonly productName?: string;
  readonly stageText?: string;
  readonly details: string;
  readonly nextPlan?: string;
  readonly requiredAction?: string;
  readonly dealId?: string;
};

export type UpdateMeetingNoteInput = Partial<CreateMeetingNoteInput> & {
  readonly meetingNoteId: string;
};

export type LinkMeetingNoteToDealInput = {
  readonly meetingNoteId: string;
  readonly dealId: string;
  readonly activityTitle?: string;
};

export type DeleteMeetingNoteResponse = {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
};
