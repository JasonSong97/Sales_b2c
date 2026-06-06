import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
  type UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteResponse } from "../meeting-note-response";
import {
  normalizeOptionalDate,
  normalizeOptionalId,
  normalizeOptionalText,
  normalizeRawText,
  normalizeRequiredText,
} from "./meeting-note-input";

export interface UpdateMeetingNoteCommand {
  readonly rawText?: string;
  readonly meetingDate?: string | null;
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

@Injectable()
export class UpdateMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    command: UpdateMeetingNoteCommand
  ) {
    const input: UpdateMeetingNoteInput = {
      userId: currentUser.id,
      meetingNoteId,
      ...(command.rawText !== undefined
        ? { rawText: normalizeRawText(command.rawText) }
        : {}),
      ...(command.meetingDate !== undefined
        ? { meetingDate: normalizeOptionalDate(command.meetingDate) }
        : {}),
      ...(command.companyName !== undefined
        ? { companyName: normalizeOptionalText(command.companyName) }
        : {}),
      ...(command.contactName !== undefined
        ? { contactName: normalizeOptionalText(command.contactName) }
        : {}),
      ...(command.department !== undefined
        ? { department: normalizeOptionalText(command.department) }
        : {}),
      ...(command.productName !== undefined
        ? { productName: normalizeOptionalText(command.productName) }
        : {}),
      ...(command.stageText !== undefined
        ? { stageText: normalizeOptionalText(command.stageText) }
        : {}),
      ...(command.details !== undefined
        ? { details: normalizeRequiredText(command.details, "details") }
        : {}),
      ...(command.nextPlan !== undefined
        ? { nextPlan: normalizeOptionalText(command.nextPlan) }
        : {}),
      ...(command.requiredAction !== undefined
        ? { requiredAction: normalizeOptionalText(command.requiredAction) }
        : {}),
      ...(command.dealId !== undefined
        ? { dealId: normalizeOptionalId(command.dealId) }
        : {}),
    };
    const meetingNote = await this.meetingNoteRepository.updateMeetingNote(input);

    return toMeetingNoteResponse(meetingNote);
  }
}
