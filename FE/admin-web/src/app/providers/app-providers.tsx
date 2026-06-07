import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/features/auth";
import { queryClient } from "@/lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AdminAuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AdminAuthProvider>
  );
}
