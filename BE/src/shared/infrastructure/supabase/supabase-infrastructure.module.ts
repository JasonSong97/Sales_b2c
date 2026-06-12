import { Module } from "@nestjs/common";
import { EXTERNAL_AUTH_VERIFIER } from "@/shared/application/ports/external-auth-verifier.port";
import { SupabaseJwtVerifierAdapter } from "./supabase-jwt-verifier.adapter";

// 역할 : SupabaseInfrastructureModule 외부 인증 검증 adapter를 공유 인프라 모듈로 제공합니다.
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
