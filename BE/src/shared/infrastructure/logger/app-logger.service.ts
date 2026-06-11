import { Injectable, type LoggerService } from "@nestjs/common";

// 역할 : AppLogger 백엔드 로그를 JSON 라인 형식으로 출력하는 logger wrapper입니다.
@Injectable()
export class AppLogger implements LoggerService {
  // 기능 : 일반 정보 로그를 JSON 라인으로 기록합니다.
  log(message: string, context?: string): void {
    this.write("log", message, context);
  }

  // 기능 : 오류 로그를 JSON 라인으로 기록합니다.
  error(message: string, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }

  // 기능 : 경고 로그를 JSON 라인으로 기록합니다.
  warn(message: string, context?: string): void {
    this.write("warn", message, context);
  }

  // 기능 : debug 로그를 JSON 라인으로 기록합니다.
  debug(message: string, context?: string): void {
    this.write("debug", message, context);
  }

  // 기능 : verbose 로그를 JSON 라인으로 기록합니다.
  verbose(message: string, context?: string): void {
    this.write("verbose", message, context);
  }

  // 기능 : 로그 레벨과 context를 표준 JSON 로그 구조로 변환해 출력합니다.
  private write(
    level: "log" | "error" | "warn" | "debug" | "verbose",
    message: string,
    context?: string,
    trace?: string
  ): void {
    const entry = {
      timestamp: new Date().toISOString(),
      service: "onehand-sales-backend",
      level,
      message,
      ...(context ? { context } : {}),
      ...(trace ? { trace } : {}),
    };
    const line = `${JSON.stringify(entry)}\n`;

    if (level === "error" || level === "warn") {
      process.stderr.write(line);
      return;
    }

    process.stdout.write(line);
  }
}
