import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/infrastructure/auth.module";
import { CompanyModule } from "./modules/company/infrastructure/company.module";
import { HealthModule } from "./modules/health/infrastructure/health.module";
import { UserModule } from "./modules/user/infrastructure/user.module";

// 역할 : AppModule 애플리케이션의 루트 모듈 의존성을 조립합니다.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    HealthModule,
    AuthModule,
    UserModule,
    CompanyModule,
  ],
})
export class AppModule {}
