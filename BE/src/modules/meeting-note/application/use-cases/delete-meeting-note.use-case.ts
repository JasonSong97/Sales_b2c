import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteMeetingNoteResponse } from "../meeting-note-response";

@Injectable()
export class DeleteMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(currentUser: CurrentUserContext, meetingNoteId: string) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.meetingNoteRepository.deleteMeetingNote(
      currentUser.id,
      meetingNoteId,
      now,
      permanentDeleteAt
    );

    return toDeleteMeetingNoteResponse(result);
  }
}
