import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  BUSINESS_CARD_OCR_PORT,
  type BusinessCardOcrPort,
} from "@/modules/business-card/application/ports/business-card-ocr.port";
import {
  BUSINESS_CARD_REPOSITORY,
  type BusinessCardRepository,
} from "@/modules/business-card/application/ports/business-card.repository";
import {
  FileStorageUnavailableError,
  OcrProviderUnavailableError,
} from "@/modules/business-card/domain/business-card.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import { toBusinessCardScanResponse } from "../business-card-response";
import {
  getFileExtension,
  normalizeOptionalText,
  validateBusinessCardImage,
  type UploadedBusinessCardFile,
} from "./business-card-input";

export interface ScanBusinessCardCommand {
  readonly imageFile: UploadedBusinessCardFile | undefined;
  readonly memo?: string;
}

@Injectable()
export class ScanBusinessCardUseCase {
  constructor(
    @Inject(BUSINESS_CARD_REPOSITORY)
    private readonly businessCardRepository: BusinessCardRepository,
    @Inject(BUSINESS_CARD_OCR_PORT)
    private readonly businessCardOcrPort: BusinessCardOcrPort,
    @Inject(STORAGE_PORT)
    private readonly storagePort: StoragePort,
    private readonly bucketName: string
  ) {}

  async execute(currentUser: CurrentUserContext, command: ScanBusinessCardCommand) {
    const imageFile = validateBusinessCardImage(command.imageFile);
    const objectKey = createBusinessCardObjectKey(currentUser.id, imageFile);
    const uploaded = await this.uploadImage(imageFile, objectKey);
    const scan = await this.businessCardRepository.createScan({
      userId: currentUser.id,
      image: {
        bucket: uploaded.bucket,
        objectKey: uploaded.objectKey,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
      },
    });
    const aiJob = await this.businessCardRepository.createAiJob({
      userId: currentUser.id,
      scanId: scan.id,
      fileName: imageFile.originalname,
      contentType: imageFile.mimetype,
      sizeBytes: imageFile.size,
      memo: normalizeOptionalText(command.memo),
    });

    const ocrResult = await this.extractBusinessCard(currentUser.id, scan.id, aiJob.id, imageFile);
    const completed = await this.businessCardRepository.completeOcr({
      userId: currentUser.id,
      scanId: scan.id,
      aiJobId: aiJob.id,
      extracted: ocrResult.extracted,
      rawOutput: ocrResult.rawOutput,
    });

    return toBusinessCardScanResponse(completed);
  }

  private async extractBusinessCard(
    userId: string,
    scanId: string,
    aiJobId: string,
    imageFile: UploadedBusinessCardFile
  ) {
    try {
      return await this.businessCardOcrPort.extractBusinessCard({
        image: {
          buffer: imageFile.buffer,
          contentType: imageFile.mimetype,
          fileName: imageFile.originalname,
        },
      });
    } catch (error) {
      await this.businessCardRepository.failOcr({
        userId,
        scanId,
        aiJobId,
        errorMessage: error instanceof Error ? error.message : "OCR failed",
      });

      if (error instanceof OcrProviderUnavailableError) {
        throw error;
      }

      throw new OcrProviderUnavailableError(
        error instanceof Error ? error.message : "OCR failed"
      );
    }
  }

  private async uploadImage(file: UploadedBusinessCardFile, objectKey: string) {
    try {
      return await this.storagePort.uploadObject({
        bucket: this.bucketName,
        objectKey,
        body: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
      });
    } catch (error) {
      throw new FileStorageUnavailableError(
        error instanceof Error ? error.message : "Image upload failed"
      );
    }
  }
}

function createBusinessCardObjectKey(
  userId: string,
  file: UploadedBusinessCardFile
): string {
  const extension = getFileExtension(file.originalname);

  return `business-cards/${userId}/${randomUUID()}.${extension}`;
}
