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
import { CreateScheduleUseCase } from "@/modules/schedule/application/use-cases/create-schedule.use-case";
import { DeleteScheduleUseCase } from "@/modules/schedule/application/use-cases/delete-schedule.use-case";
import { GetScheduleUseCase } from "@/modules/schedule/application/use-cases/get-schedule.use-case";
import { GetWeeklySchedulesUseCase } from "@/modules/schedule/application/use-cases/get-weekly-schedules.use-case";
import { ListSchedulesUseCase } from "@/modules/schedule/application/use-cases/list-schedules.use-case";
import { RestoreScheduleUseCase } from "@/modules/schedule/application/use-cases/restore-schedule.use-case";
import { UpdateScheduleUseCase } from "@/modules/schedule/application/use-cases/update-schedule.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { GetWeeklySchedulesDto, ListSchedulesDto } from "./dto/schedule-query.dto";
import { CreateScheduleDto, UpdateScheduleDto } from "./dto/schedule.dto";

@UseGuards(AuthGuard)
@Controller("api/schedules")
export class ScheduleController {
  constructor(
    private readonly listSchedulesUseCase: ListSchedulesUseCase,
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly getScheduleUseCase: GetScheduleUseCase,
    private readonly updateScheduleUseCase: UpdateScheduleUseCase,
    private readonly deleteScheduleUseCase: DeleteScheduleUseCase,
    private readonly restoreScheduleUseCase: RestoreScheduleUseCase,
    private readonly getWeeklySchedulesUseCase: GetWeeklySchedulesUseCase
  ) {}

  @Get()
  listSchedules(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListSchedulesDto
  ) {
    return this.listSchedulesUseCase.execute(currentUser, query);
  }

  @Post()
  createSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateScheduleDto
  ) {
    return this.createScheduleUseCase.execute(currentUser, body);
  }

  @Get("week")
  getWeeklySchedules(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetWeeklySchedulesDto
  ) {
    return this.getWeeklySchedulesUseCase.execute(currentUser, query);
  }

  @Get(":scheduleId")
  getSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId") scheduleId: string
  ) {
    return this.getScheduleUseCase.execute(currentUser, scheduleId);
  }

  @Patch(":scheduleId")
  updateSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId") scheduleId: string,
    @Body() body: UpdateScheduleDto
  ) {
    return this.updateScheduleUseCase.execute(currentUser, scheduleId, body);
  }

  @Delete(":scheduleId")
  deleteSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId") scheduleId: string
  ) {
    return this.deleteScheduleUseCase.execute(currentUser, scheduleId);
  }

  @Post(":scheduleId/restore")
  restoreSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId") scheduleId: string
  ) {
    return this.restoreScheduleUseCase.execute(currentUser, scheduleId);
  }
}
