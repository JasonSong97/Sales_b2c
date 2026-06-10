import { ApiClientError } from "@/lib/api-client";

export function isDeletedResourceReadError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.statusCode === 410 &&
    error.isDeletedResource
  );
}
