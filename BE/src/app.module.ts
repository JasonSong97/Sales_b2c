import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./modules/health/health.module";
import { SupabaseInfrastructureModule } from "./shared/infrastructure/supabase/supabase-infrastructure.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    SupabaseInfrastructureModule,
    HealthModule,
  ],
})
export class AppModule {}
