import { DomainError } from "@/shared/domain/errors/domain-error";

export class ScheduleNotFoundError extends DomainError {
  constructor() {
    super("ScheduleNotFound", "Schedule was not found");
  }
}

export class InvalidScheduleRangeError extends DomainError {
  constructor() {
    super("InvalidScheduleRange", "Schedule end must be after start");
  }
}

export class RelatedEntityNotFoundError extends DomainError {
  constructor() {
    super("RelatedEntityNotFound", "Related entity was not found");
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
