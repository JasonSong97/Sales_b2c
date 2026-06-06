import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/auth.module";
import { BUSINESS_CARD_OCR_PORT } from "@/modules/business-card/application/ports/business-card-ocr.port";
import {
  BUSINESS_CARD_REPOSITORY,
  type BusinessCardRepository,
} from "@/modules/business-card/application/ports/business-card.repository";
import { ConfirmBusinessCardScanUseCase } from "@/modules/business-card/application/use-cases/confirm-business-card-scan.use-case";
import { GetBusinessCardScanUseCase } from "@/modules/business-card/application/use-cases/get-business-card-scan.use-case";
import { ScanBusinessCardUseCase } from "@/modules/business-card/application/use-cases/scan-business-card.use-case";
import { OpenAiBusinessCardOcrAdapter } from "@/modules/business-card/infrastructure/ocr/openai-business-card-ocr.adapter";
import { PrismaBusinessCardRepository } from "@/modules/business-card/infrastructure/persistence/prisma-business-card.repository";
import {
  STORAGE_PORT,
  type StoragePort,
} from "@/shared/application/ports/storage.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SupabaseInfrastructureModule } from "@/shared/infrastructure/supabase/supabase-infrastructure.module";
import { BusinessCardController } from "./presentation/http/business-card.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SupabaseInfrastructureModule],
  controllers: [BusinessCardController],
  providers: [
    GetBusinessCardScanUseCase,
    ConfirmBusinessCardScanUseCase,
    {
      provide: ScanBusinessCardUseCase,
      useFactory: (
        repository: BusinessCardRepository,
        ocrPort: OpenAiBusinessCardOcrAdapter,
        storagePort: StoragePort,
        configService: ConfigService
      ) =>
        new ScanBusinessCardUseCase(
          repository,
          ocrPort,
          storagePort,
          configService.get<string>("SUPABASE_STORAGE_BUCKET_BUSINESS_CARDS") ??
            "business-card-images"
        ),
      inject: [
        BUSINESS_CARD_REPOSITORY,
        BUSINESS_CARD_OCR_PORT,
        STORAGE_PORT,
        ConfigService,
      ],
    },
    {
      provide: BUSINESS_CARD_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaBusinessCardRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: BUSINESS_CARD_OCR_PORT,
      useFactory: (configService: ConfigService) =>
        new OpenAiBusinessCardOcrAdapter(configService),
      inject: [ConfigService],
    },
  ],
})
export class BusinessCardModule {}
