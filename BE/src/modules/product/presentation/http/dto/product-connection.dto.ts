import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProductConnectionDto {
  @IsIn(["COMPANY", "CONTACT", "DEAL"])
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsIn([
    "INTERESTED",
    "DELIVERED",
    "PROPOSED",
    "COMPETITOR",
    "MAINTENANCE",
    "OTHER",
  ])
  connectionType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
