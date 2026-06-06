import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateProductUseCase } from "@/modules/product/application/use-cases/create-product.use-case";
import { CreateProductConnectionUseCase } from "@/modules/product/application/use-cases/create-product-connection.use-case";
import { CreateProductLogUseCase } from "@/modules/product/application/use-cases/create-product-log.use-case";
import { DeleteProductUseCase } from "@/modules/product/application/use-cases/delete-product.use-case";
import { DeleteProductConnectionUseCase } from "@/modules/product/application/use-cases/delete-product-connection.use-case";
import { DeleteProductLogUseCase } from "@/modules/product/application/use-cases/delete-product-log.use-case";
import { GetProductUseCase } from "@/modules/product/application/use-cases/get-product.use-case";
import { ListProductsUseCase } from "@/modules/product/application/use-cases/list-products.use-case";
import { ListProductLogsUseCase } from "@/modules/product/application/use-cases/list-product-logs.use-case";
import { RestoreProductUseCase } from "@/modules/product/application/use-cases/restore-product.use-case";
import { UpdateProductUseCase } from "@/modules/product/application/use-cases/update-product.use-case";
import { UpdateProductLogUseCase } from "@/modules/product/application/use-cases/update-product-log.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { CreateProductConnectionDto } from "./dto/product-connection.dto";
import { CreateProductLogDto, UpdateProductLogDto } from "./dto/product-log.dto";
import { ListProductLogsDto, ListProductsDto } from "./dto/product-query.dto";

@UseGuards(AuthGuard)
@Controller("api/products")
export class ProductController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly restoreProductUseCase: RestoreProductUseCase,
    private readonly createProductConnectionUseCase: CreateProductConnectionUseCase,
    private readonly deleteProductConnectionUseCase: DeleteProductConnectionUseCase,
    private readonly listProductLogsUseCase: ListProductLogsUseCase,
    private readonly createProductLogUseCase: CreateProductLogUseCase,
    private readonly updateProductLogUseCase: UpdateProductLogUseCase,
    private readonly deleteProductLogUseCase: DeleteProductLogUseCase
  ) {}

  @Get()
  listProducts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListProductsDto
  ) {
    return this.listProductsUseCase.execute(currentUser, query);
  }

  @Post()
  createProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateProductDto
  ) {
    return this.createProductUseCase.execute(currentUser, body);
  }

  @Get(":productId")
  getProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string
  ) {
    return this.getProductUseCase.execute(currentUser, productId);
  }

  @Patch(":productId")
  updateProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Body() body: UpdateProductDto
  ) {
    return this.updateProductUseCase.execute(currentUser, productId, body);
  }

  @Delete(":productId")
  deleteProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string
  ) {
    return this.deleteProductUseCase.execute(currentUser, productId);
  }

  @Post(":productId/restore")
  restoreProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string
  ) {
    return this.restoreProductUseCase.execute(currentUser, productId);
  }

  @Post(":productId/connections")
  createProductConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Body() body: CreateProductConnectionDto
  ) {
    return this.createProductConnectionUseCase.execute(
      currentUser,
      productId,
      body
    );
  }

  @Delete(":productId/connections/:connectionId")
  deleteProductConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Param("connectionId") connectionId: string
  ) {
    return this.deleteProductConnectionUseCase.execute(
      currentUser,
      productId,
      connectionId
    );
  }

  @Get(":productId/logs")
  listProductLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Query() query: ListProductLogsDto
  ) {
    return this.listProductLogsUseCase.execute(currentUser, productId, query);
  }

  @Post(":productId/logs")
  createProductLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Body() body: CreateProductLogDto
  ) {
    return this.createProductLogUseCase.execute(currentUser, productId, {
      loggedAt: new Date(body.loggedAt),
      title: body.title,
      content: body.content,
    });
  }

  @Patch(":productId/logs/:logId")
  updateProductLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Param("logId") logId: string,
    @Body() body: UpdateProductLogDto
  ) {
    return this.updateProductLogUseCase.execute(currentUser, productId, logId, {
      ...(body.loggedAt !== undefined
        ? { loggedAt: new Date(body.loggedAt) }
        : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
    });
  }

  @Delete(":productId/logs/:logId")
  deleteProductLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId") productId: string,
    @Param("logId") logId: string
  ) {
    return this.deleteProductLogUseCase.execute(currentUser, productId, logId);
  }
}
