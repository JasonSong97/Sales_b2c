import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  EXPORT_FILE_GENERATOR_PORT,
  type ExportFileGeneratorPort,
} from "@/modules/import-export/application/ports/export-file-generator.port";
import {
  IMPORT_EXPORT_REPOSITORY,
  type ImportExportRepository,
} from "@/modules/import-export/application/ports/import-export.repository";
import { FileStorageUnavailableError } from "@/modules/import-export/domain/import-export.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import { toExportJobResponse } from "../import-export-response";
import {
  normalizeCreateExportJobCommand,
  normalizeScheduleWeekExportCommand,
  type CreateExportJobCommand,
} from "./export-input";

const EXPORT_FILE_TTL_DAYS = 7;

@Injectable()
export class CreateExportJobUseCase {
  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: ImportExportRepository,
    @Inject(EXPORT_FILE_GENERATOR_PORT)
    private readonly exportFileGeneratorPort: ExportFileGeneratorPort,
    @Inject(STORAGE_PORT)
    private readonly storagePort: StoragePort,
    private readonly bucketName: string
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateExportJobCommand) {
    const normalized = normalizeCreateExportJobCommand(command);

    return this.createExport(currentUser, normalized);
  }

  async executeScheduleWeek(
    currentUser: CurrentUserContext,
    command: {
      readonly format?: unknown;
      readonly includeSensitiveData?: boolean;
      readonly sensitiveConfirm?: boolean;
      readonly from?: unknown;
      readonly to?: unknown;
    }
  ) {
    const normalized = normalizeScheduleWeekExportCommand(command);

    return this.createExport(currentUser, normalized);
  }

  private async createExport(
    currentUser: CurrentUserContext,
    command: ReturnType<typeof normalizeCreateExportJobCommand>
  ) {
    const exportJob = await this.importExportRepository.createExportJob({
      userId: currentUser.id,
      targetType: command.targetType,
      format: command.format,
      includeSensitiveData: command.includeSensitiveData,
      sensitiveWarningAccepted: command.sensitiveWarningAccepted,
      filters: command.filters,
    });

    try {
      const exportData = await this.importExportRepository.listExportData({
        userId: currentUser.id,
        targetType: command.targetType,
        includeSensitiveData: command.includeSensitiveData,
        filters: command.filters,
      });
      const generated = await this.exportFileGeneratorPort.generate({
        format: command.format,
        data: exportData,
      });
      const uploaded = await this.storagePort.uploadObject({
        bucket: this.bucketName,
        objectKey: createExportObjectKey(
          currentUser.id,
          exportJob.id,
          generated.fileName
        ),
        body: generated.buffer,
        contentType: generated.contentType,
        fileName: generated.fileName,
      });
      const completed = await this.importExportRepository.completeExportJob({
        userId: currentUser.id,
        exportJobId: exportJob.id,
        file: uploaded,
        rowCount: exportData.rows.length,
        expiresAt: addDays(new Date(), EXPORT_FILE_TTL_DAYS),
      });

      return toExportJobResponse(completed);
    } catch (error) {
      await this.importExportRepository.failExportJob({
        userId: currentUser.id,
        exportJobId: exportJob.id,
        errorMessage: error instanceof Error ? error.message : "Export failed",
      });

      if (error instanceof FileStorageUnavailableError) {
        throw error;
      }

      throw new FileStorageUnavailableError(
        error instanceof Error ? error.message : "Export failed"
      );
    }
  }
}

function createExportObjectKey(
  userId: string,
  exportJobId: string,
  fileName: string
): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "xlsx";

  return `exports/${userId}/${exportJobId}/${randomUUID()}.${extension}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}
