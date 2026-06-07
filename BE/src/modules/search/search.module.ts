import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { SEARCH_REPOSITORY } from "@/modules/search/application/ports/search.repository";
import { SearchAllUseCase } from "@/modules/search/application/use-cases/search-all.use-case";
import { PrismaSearchRepository } from "@/modules/search/infrastructure/persistence/prisma-search.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SearchController } from "./presentation/http/search.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [SearchController],
  providers: [
    SearchAllUseCase,
    {
      provide: SEARCH_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaSearchRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class SearchModule {}
