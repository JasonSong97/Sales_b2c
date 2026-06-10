import { ConfigService } from "@nestjs/config";

// 기능 : 필수 설정값을 읽고 비어 있으면 명시적인 오류를 발생시킵니다.
export function getRequiredConfig(
  configService: ConfigService,
  key: string
): string {
  const value = configService.get<string>(key);

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
