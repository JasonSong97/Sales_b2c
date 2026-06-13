import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";
import { ProductListSort } from "@/modules/product/application/ports/product.repository";

// 역할 : ListProductsQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class ListProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @IsOptional()
  @IsUUID()
  productStatusId?: string;

  @IsOptional()
  @IsEnum(ProductListSort)
  sort?: ProductListSort;
}

// 역할 : ExportProductsQueryDto HTTP export 요청 값을 검증하기 위한 DTO입니다.
export class ExportProductsQueryDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @IsOptional()
  @IsUUID()
  productStatusId?: string;

  @IsOptional()
  @IsEnum(ProductListSort)
  sort?: ProductListSort;
}

// 역할 : CursorQueryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}

// 역할 : CreateProductDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateProductDto {
  @IsString()
  productName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  productPrice!: number;

  @IsUUID()
  productCategoryId!: string;

  @IsUUID()
  productStatusId!: string;

  @IsOptional()
  @IsString()
  productMemo?: string | null;
}

// 역할 : UpdateProductDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  productPrice?: number;

  @IsOptional()
  @IsUUID()
  productCategoryId?: string;

  @IsOptional()
  @IsUUID()
  productStatusId?: string;
}

// 역할 : CreateProductCategoryDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateProductCategoryDto {
  @IsString()
  categoryName!: string;
}

// 역할 : CreateProductStatusDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateProductStatusDto {
  @IsString()
  statusName!: string;
}

// 역할 : CreateProductMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateProductMemoLogDto {
  @IsString()
  memoType!: string;

  @IsString()
  memo!: string;
}

// 역할 : UpdateProductMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateProductMemoLogDto {
  @IsOptional()
  @IsString()
  memoType?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

// 역할 : CreateProductPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateProductPrivateMemoLogDto {
  @IsString()
  memo!: string;
}

// 역할 : UpdateProductPrivateMemoLogDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class UpdateProductPrivateMemoLogDto {
  @IsString()
  memo!: string;
}
