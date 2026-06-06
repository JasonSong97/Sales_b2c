import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateExportJobUseCase } from "@/modules/import-export/application/use-cases/create-export-job.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateScheduleWeekExportDto } from "./dto/export.dto";

@UseGuards(AuthGuard)
@Controller("api/schedules/week")
export class ScheduleExportController {
  constructor(private readonly createExportJobUseCase: CreateExportJobUseCase) {}

  @Post("export")
  createScheduleWeekExport(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateScheduleWeekExportDto
  ) {
    return this.createExportJobUseCase.executeScheduleWeek(currentUser, body);
  }
}
