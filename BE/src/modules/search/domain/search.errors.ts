import { DomainError } from "@/shared/domain/errors/domain-error";

export class SearchQueryRequiredError extends DomainError {
  constructor() {
    super("SearchQueryRequired", "Search query must be at least 2 characters");
  }
}
