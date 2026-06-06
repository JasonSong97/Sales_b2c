import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import { ExportJobNotFoundError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toExportJobResponse } from "../import-export-response";

@Injectable()
export class GetExportJobUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository
  ) {}

  async execute(currentUser: CurrentUserContext, exportJobId: string) {
    const exportJob = await this.importExportRepository.getExportJob(
      currentUser.id,
      exportJobId
    );

    if (!exportJob) {
      throw new ExportJobNotFoundError();
    }

    return toExportJobResponse(exportJob);
  }
}
