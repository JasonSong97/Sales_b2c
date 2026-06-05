import { Module } from "@nestjs/common";
import { EXTERNAL_AUTH_VERIFIER } from "@/shared/application/ports/external-auth-verifier.port";
import { STORAGE_PORT } from "@/shared/application/ports/storage.port";
import { SupabaseJwtVerifierAdapter } from "./supabase-jwt-verifier.adapter";
import { SupabaseStorageAdapter } from "./supabase-storage.adapter";

@Module({
  providers: [
    SupabaseJwtVerifierAdapter,
    SupabaseStorageAdapter,
    {
      provide: EXTERNAL_AUTH_VERIFIER,
      useExisting: SupabaseJwtVerifierAdapter,
    },
    {
      provide: STORAGE_PORT,
      useExisting: SupabaseStorageAdapter,
    },
  ],
  exports: [EXTERNAL_AUTH_VERIFIER, STORAGE_PORT],
})
export class SupabaseInfrastructureModule {}
