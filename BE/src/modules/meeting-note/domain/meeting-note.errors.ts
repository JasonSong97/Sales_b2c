import { DomainError } from "@/shared/domain/errors/domain-error";

export class MeetingNoteNotFoundError extends DomainError {
  constructor() {
    super("MeetingNoteNotFound", "Meeting note was not found");
  }
}

export class DealNotFoundError extends DomainError {
  constructor() {
    super("DealNotFound", "Deal was not found");
  }
}

export class InvalidMeetingNoteGeneratedFieldsError extends DomainError {
  constructor(message = "Invalid meeting note generated fields") {
    super("InvalidMeetingNoteGeneratedFields", message);
  }
}

export class AiProviderUnavailableError extends DomainError {
  constructor(message = "AI provider is unavailable") {
    super("AiProviderUnavailable", message);
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
