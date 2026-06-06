import { Inject, Injectable } from "@nestjs/common";
import {
  AI_MEETING_NOTE_PORT,
  type AiMeetingNotePort,
} from "@/modules/meeting-note/application/ports/ai-meeting-note.port";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toGeneratedMeetingNoteResponse } from "../meeting-note-response";
import {
  normalizeOptionalDate,
  normalizeOptionalText,
  normalizeRawText,
} from "./meeting-note-input";

export interface GenerateMeetingNoteCommand {
  readonly rawText: string;
  readonly meetingDate?: string;
  readonly companyHint?: string;
  readonly contactHint?: string;
}

@Injectable()
export class GenerateMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository,
    @Inject(AI_MEETING_NOTE_PORT)
    private readonly aiMeetingNotePort: AiMeetingNotePort
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    command: GenerateMeetingNoteCommand
  ) {
    const rawText = normalizeRawText(command.rawText);
    const aiJob = await this.meetingNoteRepository.createAiJob({
      userId: currentUser.id,
      rawText,
    });

    try {
      const fields = await this.aiMeetingNotePort.generateMeetingNote({
        rawText,
        meetingDate: normalizeOptionalDate(command.meetingDate),
        companyHint: normalizeOptionalText(command.companyHint),
        contactHint: normalizeOptionalText(command.contactHint),
      });
      await this.meetingNoteRepository.completeAiJob({
        userId: currentUser.id,
        aiJobId: aiJob.id,
        output: fields,
      });

      return toGeneratedMeetingNoteResponse(aiJob.id, fields);
    } catch (error) {
      await this.meetingNoteRepository.failAiJob({
        userId: currentUser.id,
        aiJobId: aiJob.id,
        errorMessage: error instanceof Error ? error.message : "AI failed",
      });
      throw error;
    }
  }
}
