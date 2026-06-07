import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/auth.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { AI_MEETING_NOTE_PORT } from "@/modules/meeting-note/application/ports/ai-meeting-note.port";
import { MEETING_NOTE_REPOSITORY } from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { CreateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/create-meeting-note.use-case";
import { DeleteMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/delete-meeting-note.use-case";
import { GenerateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/generate-meeting-note.use-case";
import { GetMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/get-meeting-note.use-case";
import { LinkMeetingNoteToDealUseCase } from "@/modules/meeting-note/application/use-cases/link-meeting-note-to-deal.use-case";
import { ListMeetingNotesUseCase } from "@/modules/meeting-note/application/use-cases/list-meeting-notes.use-case";
import { RestoreMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/restore-meeting-note.use-case";
import { UpdateMeetingNoteUseCase } from "@/modules/meeting-note/application/use-cases/update-meeting-note.use-case";
import { OpenAiMeetingNoteAdapter } from "@/modules/meeting-note/infrastructure/ai/openai-meeting-note.adapter";
import { PrismaMeetingNoteRepository } from "@/modules/meeting-note/infrastructure/persistence/prisma-meeting-note.repository";
import {
  ENCRYPTION_PORT,
  type EncryptionPort,
} from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { MeetingNoteController } from "./presentation/http/meeting-note.controller";

@Module({
  imports: [
    AuthModule,
    PrismaInfrastructureModule,
    SecurityInfrastructureModule,
    NotificationModule,
  ],
  controllers: [MeetingNoteController],
  providers: [
    ListMeetingNotesUseCase,
    CreateMeetingNoteUseCase,
    GenerateMeetingNoteUseCase,
    GetMeetingNoteUseCase,
    UpdateMeetingNoteUseCase,
    LinkMeetingNoteToDealUseCase,
    DeleteMeetingNoteUseCase,
    RestoreMeetingNoteUseCase,
    {
      provide: MEETING_NOTE_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaMeetingNoteRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
    {
      provide: AI_MEETING_NOTE_PORT,
      useFactory: (configService: ConfigService) =>
        new OpenAiMeetingNoteAdapter(configService),
      inject: [ConfigService],
    },
  ],
})
export class MeetingNoteModule {}
