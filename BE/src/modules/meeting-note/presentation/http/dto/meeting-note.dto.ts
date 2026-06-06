import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class GenerateMeetingNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  rawText!: string;

  @IsOptional()
  @IsISO8601()
  meetingDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyHint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactHint?: string;
}

export class CreateMeetingNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  rawText!: string;

  @IsISO8601()
  meetingDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  productName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stageText?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  details!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  nextPlan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requiredAction?: string;

  @IsOptional()
  @IsString()
  dealId?: string;
}

export class UpdateMeetingNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  rawText?: string;

  @IsOptional()
  @IsISO8601()
  meetingDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  productName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stageText?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  nextPlan?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requiredAction?: string | null;

  @IsOptional()
  @IsString()
  dealId?: string | null;
}

export class LinkMeetingNoteToDealDto {
  @IsString()
  @MinLength(1)
  dealId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  activityTitle?: string;
}
