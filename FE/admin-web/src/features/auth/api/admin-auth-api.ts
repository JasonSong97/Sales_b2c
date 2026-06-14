import type { AdminMe } from "@/features/auth/types/admin-auth";
import { adminApiClient } from "@/lib/admin-api-client";

export function getAdminMe() {
  return adminApiClient<AdminMe>("/me");
}
