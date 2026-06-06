import { IsIn, IsISO8601, IsOptional, IsString } from "class-validator";

const scheduleSources = ["INTERNAL", "GOOGLE"];

export class ListSchedulesDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dealId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsIn(scheduleSources)
  source?: string;
}

export class GetWeeklySchedulesDto {
  @IsString()
  weekStart!: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
