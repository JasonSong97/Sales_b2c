import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { PRODUCT_REPOSITORY } from "@/modules/product/application/ports/product.repository";
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
import { PrismaProductRepository } from "@/modules/product/infrastructure/persistence/prisma-product.repository";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { ENCRYPTION_PORT } from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { ProductController } from "./presentation/http/product.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [ProductController],
  providers: [
    ListProductsUseCase,
    CreateProductUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    RestoreProductUseCase,
    CreateProductConnectionUseCase,
    DeleteProductConnectionUseCase,
    ListProductLogsUseCase,
    CreateProductLogUseCase,
    UpdateProductLogUseCase,
    DeleteProductLogUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaProductRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
  ],
})
export class ProductModule {}
