import { InvalidImageFileError } from "@/modules/business-card/domain/business-card.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

export interface UploadedBusinessCardFile {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
  readonly size: number;
}

export const BUSINESS_CARD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateBusinessCardImage(
  file: UploadedBusinessCardFile | undefined
): UploadedBusinessCardFile {
  if (!file) {
    throw new InvalidImageFileError("imageFile is required");
  }

  if (file.size <= 0 || file.buffer.byteLength === 0) {
    throw new InvalidImageFileError("imageFile is empty");
  }

  if (file.size > BUSINESS_CARD_MAX_FILE_SIZE_BYTES) {
    throw new InvalidImageFileError("imageFile is too large");
  }

  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new InvalidImageFileError("Unsupported image MIME type");
  }

  if (!allowedExtensions.has(getFileExtension(file.originalname))) {
    throw new InvalidImageFileError("Unsupported image extension");
  }

  return file;
}

export function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  return extension;
}

export function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new ValidationDomainError(`${label} is required`);
  }

  return trimmed;
}

export function normalizeRequiredId(value: string, label = "id"): string {
  return normalizeRequiredText(value, label);
}
