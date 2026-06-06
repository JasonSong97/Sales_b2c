import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { BusinessCardCompanyMode } from "@/modules/business-card/application/ports/business-card.repository";

const companyModes: BusinessCardCompanyMode[] = ["EXISTING", "NEW", "NONE"];

export class ScanBusinessCardDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;
}

export class ConfirmBusinessCardScanDto {
  @IsIn(companyModes)
  companyMode!: BusinessCardCompanyMode;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  companyName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  contactName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;
}
