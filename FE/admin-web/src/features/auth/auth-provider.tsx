import { useMemo, useState, type ReactNode } from "react";
import {
  AdminAuthContext,
  type AdminAuthContextValue,
  type AdminAuthRole,
} from "@/features/auth/auth-context";
import {
  clearAdminApiAccessToken,
  setAdminApiAccessToken,
} from "@/lib/admin-api-client";

const adminMockAccessToken = "mock-admin-web-access-token";
const userMockAccessToken = "mock-non-admin-web-access-token";

export function AdminAuthProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [role, setRole] = useState<AdminAuthRole | null>(null);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated: role !== null,
      role,
      loginAsAdmin: () => {
        setAdminApiAccessToken(adminMockAccessToken);
        setRole("ADMIN");
      },
      loginAsUser: () => {
        setAdminApiAccessToken(userMockAccessToken);
        setRole("USER");
      },
      logout: () => {
        clearAdminApiAccessToken();
        setRole(null);
      },
    }),
    [role]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
