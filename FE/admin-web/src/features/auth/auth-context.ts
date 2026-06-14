import { createContext, useContext } from "react";
import type { AdminMe } from "@/features/auth/types/admin-auth";

export type AdminAuthRole = "ADMIN" | "USER";

export type AdminAuthContextValue = {
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isPending: boolean;
  readonly error: string | null;
  readonly role: AdminAuthRole | null;
  readonly user: AdminMe | null;
  readonly loginAsAdmin: () => Promise<void>;
  readonly loginAsUser: () => Promise<void>;
  readonly loginWithAccessToken: (accessToken: string) => Promise<void>;
  readonly logout: () => void;
  readonly clearError: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null
);

export function useAdminAuthSession() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuthSession must be used within AdminAuthProvider");
  }

  return context;
}
