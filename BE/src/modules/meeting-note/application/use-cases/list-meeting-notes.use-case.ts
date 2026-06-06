import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteListResponse } from "../meeting-note-response";
import {
  normalizeOptionalId,
  normalizeOptionalText,
  normalizePagination,
} from "./meeting-note-input";

export interface ListMeetingNotesQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly dealId?: string;
  readonly search?: string;
  readonly includeDeleted?: boolean;
}

@Injectable()
export class ListMeetingNotesUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListMeetingNotesQuery) {
    const pagination = normalizePagination(query);
    const result = await this.meetingNoteRepository.listMeetingNotes({
      userId: currentUser.id,
      page: pagination.page,
      pageSize: pagination.pageSize,
      dealId: normalizeOptionalId(query.dealId),
      search: normalizeOptionalText(query.search),
      includeDeleted: query.includeDeleted ?? false,
    });

    return toMeetingNoteListResponse(result);
  }
}
