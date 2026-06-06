import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteDetailResponse } from "../meeting-note-response";
import { assertMeetingNoteExists, assertNotDeleted } from "./meeting-note-input";

@Injectable()
export class GetMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(currentUser: CurrentUserContext, meetingNoteId: string) {
    const detail = assertMeetingNoteExists(
      await this.meetingNoteRepository.getMeetingNoteDetail(
        currentUser.id,
        meetingNoteId
      )
    );
    assertNotDeleted(detail.meetingNote.deletedAt, "read");

    return toMeetingNoteDetailResponse(detail);
  }
}
