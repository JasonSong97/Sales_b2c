import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListNotificationsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(["ALL", "READ", "UNREAD"])
  status?: string;
}
