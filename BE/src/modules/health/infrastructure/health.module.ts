import { Module } from "@nestjs/common";
import { HealthController } from "../presentation/health.controller";

// 역할 : HealthModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
