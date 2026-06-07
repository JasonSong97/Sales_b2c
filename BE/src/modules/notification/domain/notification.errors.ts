import { DomainError } from "@/shared/domain/errors/domain-error";

export class NotificationNotFoundError extends DomainError {
  constructor() {
    super("NotificationNotFound", "Notification was not found");
  }
}

export class PushSubscriptionNotFoundError extends DomainError {
  constructor() {
    super("PushSubscriptionNotFound", "Browser push subscription was not found");
  }
}

export class PushSubscriptionConflictError extends DomainError {
  constructor() {
    super("PushSubscriptionConflict", "Browser push subscription already exists");
  }
}
