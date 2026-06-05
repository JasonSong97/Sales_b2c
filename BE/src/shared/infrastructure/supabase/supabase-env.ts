import { ConfigService } from "@nestjs/config";

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
