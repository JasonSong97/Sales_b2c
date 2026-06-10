import { IsBoolean, IsOptional } from "class-validator";

export class UpdateMySettingsDto {
  @IsOptional()
  @IsBoolean()
  sensitiveWarningEnabled?: boolean;
}

