import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { SCHEDULE_REPOSITORY } from "@/modules/schedule/application/ports/schedule.repository";
import { CreateScheduleUseCase } from "@/modules/schedule/application/use-cases/create-schedule.use-case";
import { DeleteScheduleUseCase } from "@/modules/schedule/application/use-cases/delete-schedule.use-case";
import { GetScheduleUseCase } from "@/modules/schedule/application/use-cases/get-schedule.use-case";
import { GetWeeklySchedulesUseCase } from "@/modules/schedule/application/use-cases/get-weekly-schedules.use-case";
import { ListSchedulesUseCase } from "@/modules/schedule/application/use-cases/list-schedules.use-case";
import { RestoreScheduleUseCase } from "@/modules/schedule/application/use-cases/restore-schedule.use-case";
import { UpdateScheduleUseCase } from "@/modules/schedule/application/use-cases/update-schedule.use-case";
import { PrismaScheduleRepository } from "@/modules/schedule/infrastructure/persistence/prisma-schedule.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ScheduleController } from "./presentation/http/schedule.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [ScheduleController],
  providers: [
    ListSchedulesUseCase,
    CreateScheduleUseCase,
    GetScheduleUseCase,
    UpdateScheduleUseCase,
    DeleteScheduleUseCase,
    RestoreScheduleUseCase,
    GetWeeklySchedulesUseCase,
    {
      provide: SCHEDULE_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaScheduleRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class ScheduleModule {}
