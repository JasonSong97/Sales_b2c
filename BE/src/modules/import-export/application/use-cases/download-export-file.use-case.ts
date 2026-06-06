import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import {
  ExportFileNotReadyError,
  ExportJobNotFoundError,
} from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import type { ExportDownloadResponse } from "../import-export-response";

const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 600;

@Injectable()
export class DownloadExportFileUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository,
    @Inject(STORAGE_PORT)
    private readonly storagePort: StoragePort
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    exportJobId: string
  ): Promise<ExportDownloadResponse> {
    const exportJob = await this.importExportRepository.getExportJob(
      currentUser.id,
      exportJobId
    );

    if (!exportJob) {
      throw new ExportJobNotFoundError();
    }

    if (exportJob.status !== "COMPLETED" || !exportJob.file) {
      throw new ExportFileNotReadyError();
    }

    const signed = await this.storagePort.createSignedDownloadUrl({
      bucket: exportJob.file.bucket,
      objectKey: exportJob.file.objectKey,
      expiresInSeconds: DOWNLOAD_URL_EXPIRES_IN_SECONDS,
    });

    return {
      downloadUrl: signed.url,
      expiresAt: new Date(
        Date.now() + signed.expiresInSeconds * 1000
      ).toISOString(),
    };
  }
}
