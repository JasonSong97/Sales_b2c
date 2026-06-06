import type { GeneratedMeetingNoteFields } from "./meeting-note.repository";

export const AI_MEETING_NOTE_PORT = Symbol("AI_MEETING_NOTE_PORT");

export interface GenerateMeetingNoteInput {
  readonly rawText: string;
  readonly meetingDate: Date | null;
  readonly companyHint: string | null;
  readonly contactHint: string | null;
}

export interface AiMeetingNotePort {
  generateMeetingNote(
    input: GenerateMeetingNoteInput
  ): Promise<GeneratedMeetingNoteFields>;
}
