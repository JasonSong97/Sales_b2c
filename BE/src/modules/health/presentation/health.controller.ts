import { Controller, Get } from "@nestjs/common";

// 역할 : HealthController HTTP API 요청을 받아 application 계층으로 위임합니다.
@Controller("api/health")
export class HealthController {
  // API : 상태, 백엔드 health check
  @Get()
  getHealth() {
    // 1. 현재 서버 상태 응답을 생성한다.
    return {
      status: "ok",
      service: "onehand-sales-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
