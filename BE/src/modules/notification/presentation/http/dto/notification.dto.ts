import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10080)
  defaultReminderMinutes?: number;

  @IsOptional()
  @IsBoolean()
  emailNotificationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  browserPushEnabled?: boolean;
}

export class BrowserPushKeysDto {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

export class CreateBrowserPushSubscriptionDto {
  @IsString()
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BrowserPushKeysDto)
  keys!: BrowserPushKeysDto;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  deviceLabel?: string;
}
