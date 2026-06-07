import { createContext, useContext } from "react";

export type AdminAuthRole = "ADMIN" | "USER";

export type AdminAuthContextValue = {
  readonly isAuthenticated: boolean;
  readonly role: AdminAuthRole | null;
  readonly loginAsAdmin: () => void;
  readonly loginAsUser: () => void;
  readonly logout: () => void;
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
