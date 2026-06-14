import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getAdminMe } from "@/features/auth/api/admin-auth-api";
import {
  AdminAuthContext,
  type AdminAuthContextValue,
  type AdminAuthRole,
} from "@/features/auth/auth-context";
import type { AdminMe } from "@/features/auth/types/admin-auth";
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
  const [user, setUser] = useState<AdminMe | null>(null);
  const [role, setRole] = useState<AdminAuthRole | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAdminMe = useCallback(
    async (accessToken: string, fallbackRole?: AdminAuthRole) => {
      setIsPending(true);
      setError(null);
      setAdminApiAccessToken(accessToken);

      try {
        const adminMe = await getAdminMe();
        setUser(adminMe);
        setRole(adminMe.role);
      } catch (nextError) {
        if (fallbackRole) {
          setUser(null);
          setRole(fallbackRole);
          return;
        }

        clearAdminApiAccessToken();
        setUser(null);
        setRole(null);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "관리자 권한을 확인하지 못했습니다."
        );
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated: role !== null,
      isInitializing: false,
      isPending,
      error,
      role,
      user,
      clearError: () => setError(null),
      loginAsAdmin: async () => verifyAdminMe(adminMockAccessToken, "ADMIN"),
      loginAsUser: async () => verifyAdminMe(userMockAccessToken, "USER"),
      loginWithAccessToken: async (accessToken) => verifyAdminMe(accessToken),
      logout: () => {
        clearAdminApiAccessToken();
        setUser(null);
        setRole(null);
        setError(null);
      },
    }),
    [error, isPending, role, user, verifyAdminMe]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
