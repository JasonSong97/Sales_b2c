import { DomainError } from "@/shared/domain/errors/domain-error";

export class BusinessCardScanNotFoundError extends DomainError {
  constructor() {
    super("BusinessCardScanNotFound", "Business card scan was not found");
  }
}

export class InvalidImageFileError extends DomainError {
  constructor(message = "Invalid image file") {
    super("InvalidImageFile", message);
  }
}

export class OcrProviderUnavailableError extends DomainError {
  constructor(message = "OCR provider is unavailable") {
    super("OcrProviderUnavailable", message);
  }
}

export class FileStorageUnavailableError extends DomainError {
  constructor(message = "File storage is unavailable") {
    super("FileStorageUnavailable", message);
  }
}

export class BusinessCardAlreadyConfirmedError extends DomainError {
  constructor() {
    super("BusinessCardAlreadyConfirmed", "Business card scan is already confirmed");
  }
}

export class InvalidBusinessCardConfirmationError extends DomainError {
  constructor(message = "Invalid business card confirmation") {
    super("InvalidBusinessCardConfirmation", message);
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
