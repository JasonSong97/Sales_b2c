import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfirmBusinessCardScanUseCase } from "@/modules/business-card/application/use-cases/confirm-business-card-scan.use-case";
import { GetBusinessCardScanUseCase } from "@/modules/business-card/application/use-cases/get-business-card-scan.use-case";
import {
  BUSINESS_CARD_MAX_FILE_SIZE_BYTES,
  type UploadedBusinessCardFile,
} from "@/modules/business-card/application/use-cases/business-card-input";
import { ScanBusinessCardUseCase } from "@/modules/business-card/application/use-cases/scan-business-card.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ConfirmBusinessCardScanDto, ScanBusinessCardDto } from "./dto/business-card.dto";

@UseGuards(AuthGuard)
@Controller("api/business-cards")
export class BusinessCardController {
  constructor(
    private readonly scanBusinessCardUseCase: ScanBusinessCardUseCase,
    private readonly getBusinessCardScanUseCase: GetBusinessCardScanUseCase,
    private readonly confirmBusinessCardScanUseCase: ConfirmBusinessCardScanUseCase
  ) {}

  @Post("scan")
  @UseInterceptors(
    FileInterceptor("imageFile", {
      limits: { fileSize: BUSINESS_CARD_MAX_FILE_SIZE_BYTES },
    })
  )
  scanBusinessCard(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() imageFile: UploadedBusinessCardFile | undefined,
    @Body() body: ScanBusinessCardDto
  ) {
    return this.scanBusinessCardUseCase.execute(currentUser, {
      imageFile,
      memo: body.memo,
    });
  }

  @Get(":scanId")
  getBusinessCardScan(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scanId") scanId: string
  ) {
    return this.getBusinessCardScanUseCase.execute(currentUser, scanId);
  }

  @Post(":scanId/confirm")
  confirmBusinessCardScan(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scanId") scanId: string,
    @Body() body: ConfirmBusinessCardScanDto
  ) {
    return this.confirmBusinessCardScanUseCase.execute(
      currentUser,
      scanId,
      body
    );
  }
}
