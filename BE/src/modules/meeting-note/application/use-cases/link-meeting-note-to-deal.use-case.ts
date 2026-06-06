import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteResponse } from "../meeting-note-response";
import { normalizeOptionalText, normalizeRequiredId } from "./meeting-note-input";

export interface LinkMeetingNoteToDealCommand {
  readonly dealId: string;
  readonly activityTitle?: string;
}

@Injectable()
export class LinkMeetingNoteToDealUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    command: LinkMeetingNoteToDealCommand
  ) {
    const meetingNote = await this.meetingNoteRepository.linkMeetingNoteToDeal({
      userId: currentUser.id,
      meetingNoteId,
      dealId: normalizeRequiredId(command.dealId),
      activityTitle: normalizeOptionalText(command.activityTitle),
    });

    return toMeetingNoteResponse(meetingNote);
  }
}
