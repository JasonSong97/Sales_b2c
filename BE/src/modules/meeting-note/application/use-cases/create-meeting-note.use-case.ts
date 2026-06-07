import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { NotificationScheduler } from "@/modules/notification/application/use-cases/notification-scheduler.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toMeetingNoteResponse } from "../meeting-note-response";
import {
  normalizeOptionalId,
  normalizeOptionalText,
  normalizeRawText,
  normalizeRequiredDate,
  normalizeRequiredText,
} from "./meeting-note-input";

export interface CreateMeetingNoteCommand {
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
}

@Injectable()
export class CreateMeetingNoteUseCase {
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository,
    private readonly notificationScheduler: NotificationScheduler
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    command: CreateMeetingNoteCommand
  ) {
    const meetingNote = await this.meetingNoteRepository.createMeetingNote({
      userId: currentUser.id,
      rawText: normalizeRawText(command.rawText),
      meetingDate: normalizeRequiredDate(command.meetingDate, "meetingDate"),
      companyName: normalizeOptionalText(command.companyName),
      contactName: normalizeOptionalText(command.contactName),
      department: normalizeOptionalText(command.department),
      productName: normalizeOptionalText(command.productName),
      stageText: normalizeOptionalText(command.stageText),
      details: normalizeRequiredText(command.details, "details"),
      nextPlan: normalizeOptionalText(command.nextPlan),
      requiredAction: normalizeOptionalText(command.requiredAction),
      dealId: normalizeOptionalId(command.dealId),
    });

    await this.notificationScheduler.createMeetingNoteGeneratedNotification({
      userId: currentUser.id,
      meetingNoteId: meetingNote.id,
      meetingTitle: meetingNote.details ?? "회의록이 저장되었습니다.",
      createdAt: meetingNote.createdAt,
    });

    return toMeetingNoteResponse(meetingNote);
  }
}
