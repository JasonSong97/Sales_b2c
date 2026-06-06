import { DomainError } from "@/shared/domain/errors/domain-error";

export class ProductNotFoundError extends DomainError {
  constructor() {
    super("ProductNotFound", "Product was not found");
  }
}

export class ProductLogNotFoundError extends DomainError {
  constructor() {
    super("ProductLogNotFound", "Product log was not found");
  }
}

export class ProductConnectionNotFoundError extends DomainError {
  constructor() {
    super("ProductConnectionNotFound", "Product connection was not found");
  }
}

export class ProductConnectionTargetNotFoundError extends DomainError {
  constructor() {
    super(
      "ProductConnectionTargetNotFound",
      "Product connection target was not found"
    );
  }
}

export class DuplicateProductConnectionError extends DomainError {
  constructor() {
    super("DuplicateProductConnection", "Product connection already exists");
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
