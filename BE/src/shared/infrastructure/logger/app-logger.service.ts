import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class AppLogger extends ConsoleLogger {
  // 기능 : 백엔드 서비스명과 timestamp 옵션이 적용된 콘솔 로거를 초기화합니다.
  constructor() {
    super("onehand-sales-backend", {
      timestamp: true,
    });
  }
}
