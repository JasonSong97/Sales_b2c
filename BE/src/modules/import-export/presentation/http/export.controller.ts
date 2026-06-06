import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CreateExportJobUseCase } from "@/modules/import-export/application/use-cases/create-export-job.use-case";
import { DownloadExportFileUseCase } from "@/modules/import-export/application/use-cases/download-export-file.use-case";
import { GetExportJobUseCase } from "@/modules/import-export/application/use-cases/get-export-job.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateExportJobDto } from "./dto/export.dto";

@UseGuards(AuthGuard)
@Controller("api/exports")
export class ExportController {
  constructor(
    private readonly createExportJobUseCase: CreateExportJobUseCase,
    private readonly getExportJobUseCase: GetExportJobUseCase,
    private readonly downloadExportFileUseCase: DownloadExportFileUseCase
  ) {}

  @Post()
  createExportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateExportJobDto
  ) {
    return this.createExportJobUseCase.execute(currentUser, body);
  }

  @Get(":exportJobId")
  getExportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("exportJobId") exportJobId: string
  ) {
    return this.getExportJobUseCase.execute(currentUser, exportJobId);
  }

  @Get(":exportJobId/download")
  downloadExportFile(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("exportJobId") exportJobId: string
  ) {
    return this.downloadExportFileUseCase.execute(currentUser, exportJobId);
  }
}
