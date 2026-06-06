import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/create-meeting-note.use-case";
import { DeleteMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/delete-meeting-note.use-case";
import { GenerateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/generate-meeting-note.use-case";
import { GetMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/get-meeting-note.use-case";
import { LinkMeetingNoteToDealUseCase } from "@/modules/meeting-note/application/use-cases/link-meeting-note-to-deal.use-case";
import { ListMeetingNotesUseCase } from "@/modules/meeting-note/application/use-cases/list-meeting-notes.use-case";
import { RestoreMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/restore-meeting-note.use-case";
import { UpdateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/update-meeting-note.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ListMeetingNotesDto } from "./dto/meeting-note-query.dto";
import {
  CreateMeetingNoteDto,
  GenerateMeetingNoteDto,
  LinkMeetingNoteToDealDto,
  UpdateMeetingNoteDto,
} from "./dto/meeting-note.dto";

@UseGuards(AuthGuard)
@Controller("api/meeting-notes")
export class MeetingNoteController {
  constructor(
    private readonly listMeetingNotesUseCase: ListMeetingNotesUseCase,
    private readonly createMeetingNoteUseCase: CreateMeetingNoteUseCase,
    private readonly generateMeetingNoteUseCase: GenerateMeetingNoteUseCase,
    private readonly getMeetingNoteUseCase: GetMeetingNoteUseCase,
    private readonly updateMeetingNoteUseCase: UpdateMeetingNoteUseCase,
    private readonly linkMeetingNoteToDealUseCase: LinkMeetingNoteToDealUseCase,
    private readonly deleteMeetingNoteUseCase: DeleteMeetingNoteUseCase,
    private readonly restoreMeetingNoteUseCase: RestoreMeetingNoteUseCase
  ) {}

  @Get()
  listMeetingNotes(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListMeetingNotesDto
  ) {
    return this.listMeetingNotesUseCase.execute(currentUser, query);
  }

  @Post("generate")
  generateMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: GenerateMeetingNoteDto
  ) {
    return this.generateMeetingNoteUseCase.execute(currentUser, body);
  }

  @Post()
  createMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeetingNoteDto
  ) {
    return this.createMeetingNoteUseCase.execute(currentUser, body);
  }

  @Get(":meetingNoteId")
  getMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId") meetingNoteId: string
  ) {
    return this.getMeetingNoteUseCase.execute(currentUser, meetingNoteId);
  }

  @Patch(":meetingNoteId")
  updateMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId") meetingNoteId: string,
    @Body() body: UpdateMeetingNoteDto
  ) {
    return this.updateMeetingNoteUseCase.execute(
      currentUser,
      meetingNoteId,
      body
    );
  }

  @Post(":meetingNoteId/link-deal")
  linkMeetingNoteToDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId") meetingNoteId: string,
    @Body() body: LinkMeetingNoteToDealDto
  ) {
    return this.linkMeetingNoteToDealUseCase.execute(
      currentUser,
      meetingNoteId,
      body
    );
  }

  @Delete(":meetingNoteId")
  deleteMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId") meetingNoteId: string
  ) {
    return this.deleteMeetingNoteUseCase.execute(currentUser, meetingNoteId);
  }

  @Post(":meetingNoteId/restore")
  restoreMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId") meetingNoteId: string
  ) {
    return this.restoreMeetingNoteUseCase.execute(currentUser, meetingNoteId);
  }
}
