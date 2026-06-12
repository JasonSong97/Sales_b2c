import { IsString, MaxLength, ValidateIf } from "class-validator";

// 역할 : UpdateMyProfileDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateMyProfileDto {
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(80)
  name!: string | null;
}
