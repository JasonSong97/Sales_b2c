import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteResponse } from "../meeting-note-response";

@Injectable()
export class RestoreMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(currentUser: CurrentUserContext, meetingNoteId: string) {
    return toMeetingNoteResponse(
      await this.meetingNoteRepository.restoreMeetingNote(
        currentUser.id,
        meetingNoteId
      )
    );
  }
}
