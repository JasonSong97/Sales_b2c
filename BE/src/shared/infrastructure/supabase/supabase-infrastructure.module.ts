import { Module } from "@nestjs/common";
import { EXTERNAL_AUTH_VERIFIER } from "@/shared/application/ports/external-auth-verifier.port";
import { SupabaseJwtVerifierAdapter } from "./supabase-jwt-verifier.adapter";

@Module({
  providers: [
    SupabaseJwtVerifierAdapter,
    {
      provide: EXTERNAL_AUTH_VERIFIER,
      useExisting: SupabaseJwtVerifierAdapter,
    },
  ],
  exports: [EXTERNAL_AUTH_VERIFIER],
})
export class SupabaseInfrastructureModule {}
