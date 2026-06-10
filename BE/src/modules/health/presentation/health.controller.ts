import { Controller, Get } from "@nestjs/common";

@Controller("api/health")
export class HealthController {
  @Get()
  // 기능 : 백엔드 서비스 상태와 현재 시간을 반환합니다.
  getHealth() {
    return {
      status: "ok",
      service: "onehand-sales-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
