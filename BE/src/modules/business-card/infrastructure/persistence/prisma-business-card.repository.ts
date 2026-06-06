import {
  AiJobStatus,
  AiJobType,
  BusinessCardScanStatus as PrismaBusinessCardScanStatus,
  FileStorageProvider,
  Prisma,
} from "@prisma/client";
import {
  type BusinessCardCompanyCandidateRecord,
  type BusinessCardCompanyRecord,
  type BusinessCardConfirmRecord,
  BusinessCardRepository,
  type BusinessCardScanDetailRecord,
  type BusinessCardScanRecord,
  type BusinessCardContactRecord,
  type CompleteBusinessCardOcrInput,
  type ConfirmBusinessCardScanInput,
  type CreateBusinessCardAiJobInput,
  type CreateBusinessCardScanInput,
  type FailBusinessCardOcrInput,
} from "@/modules/business-card/application/ports/business-card.repository";
import {
  BusinessCardAlreadyConfirmedError,
  BusinessCardScanNotFoundError,
  InvalidBusinessCardConfirmationError,
  OwnershipViolationError,
} from "@/modules/business-card/domain/business-card.errors";
import { CompanyNotFoundError } from "@/modules/company/domain/company.errors";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type BusinessCardPrismaClient = PrismaService | Prisma.TransactionClient;

type BusinessCardScanRow = {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly status: PrismaBusinessCardScanStatus;
  readonly imageBucket: string;
  readonly imageObjectKey: string;
  readonly imageContentType: string | null;
  readonly imageSizeBytes: number | null;
  readonly extractedCompany: string | null;
  readonly extractedName: string | null;
  readonly extractedDepartment: string | null;
  readonly extractedPosition: string | null;
  readonly extractedPhone: string | null;
  readonly extractedEmail: string | null;
  readonly extractedAddress: string | null;
  readonly confirmedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type CompanyRow = {
  readonly id: string;
  readonly userId?: string;
  readonly name: string;
  readonly industry: string | null;
  readonly location: string | null;
  readonly description: string | null;
  readonly metadata: Prisma.JsonValue | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

type ContactRow = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly location: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
  readonly company?: { readonly name: string } | null;
};

export class PrismaBusinessCardRepository implements BusinessCardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createScan(
    input: CreateBusinessCardScanInput
  ): Promise<BusinessCardScanRecord> {
    const scan = await this.prismaService.businessCardScan.create({
      data: {
        userId: input.userId,
        status: PrismaBusinessCardScanStatus.OCR_PROCESSING,
        imageStorageProvider: FileStorageProvider.SUPABASE_STORAGE,
        imageBucket: input.image.bucket,
        imageObjectKey: input.image.objectKey,
        imageContentType: input.image.contentType,
        imageSizeBytes: input.image.sizeBytes,
      },
    });

    return this.mapScanRecord(scan);
  }

  async createAiJob(
    input: CreateBusinessCardAiJobInput
  ): Promise<{ readonly id: string }> {
    const aiJob = await this.prismaService.aiJob.create({
      data: {
        userId: input.userId,
        type: AiJobType.BUSINESS_CARD_OCR,
        status: AiJobStatus.PROCESSING,
        targetType: "BusinessCardScan",
        targetId: input.scanId,
        startedAt: new Date(),
        inputSummary: {
          fileName: input.fileName,
          contentType: input.contentType,
          sizeBytes: input.sizeBytes,
          memoLength: input.memo?.length ?? 0,
        },
      },
    });

    return { id: aiJob.id };
  }

  async completeOcr(
    input: CompleteBusinessCardOcrInput
  ): Promise<BusinessCardScanRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      await transaction.aiJob.updateMany({
        where: { id: input.aiJobId, userId: input.userId },
        data: {
          status: AiJobStatus.COMPLETED,
          output: toJsonObject(input.rawOutput),
          completedAt: new Date(),
        },
      });

      const scan = await transaction.businessCardScan.update({
        where: { id: input.scanId },
        data: {
          status: PrismaBusinessCardScanStatus.OCR_COMPLETED,
          extractedCompany: input.extracted.companyName,
          extractedName: input.extracted.contactName,
          extractedDepartment: input.extracted.department,
          extractedPosition: input.extracted.position,
          extractedPhone: input.extracted.phone,
          extractedEmail: input.extracted.email,
          extractedAddress: input.extracted.address,
          aiOutput: toJsonObject(input.rawOutput),
        },
      });

      return this.mapScanRecord(scan);
    });
  }

  async failOcr(input: FailBusinessCardOcrInput): Promise<void> {
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.aiJob.updateMany({
        where: { id: input.aiJobId, userId: input.userId },
        data: {
          status: AiJobStatus.FAILED,
          errorMessage: input.errorMessage,
          completedAt: new Date(),
        },
      });
      await transaction.businessCardScan.updateMany({
        where: { id: input.scanId, userId: input.userId },
        data: { status: PrismaBusinessCardScanStatus.FAILED },
      });
    });
  }

  async getScanDetail(
    userId: string,
    scanId: string
  ): Promise<BusinessCardScanDetailRecord | null> {
    const scan = await this.prismaService.businessCardScan.findFirst({
      where: { id: scanId, userId },
    });

    if (!scan) {
      return null;
    }

    const [companyCandidates, errorMessage] = await Promise.all([
      this.listCompanyCandidates(userId, scan.extractedCompany),
      this.getLatestOcrError(userId, scanId),
    ]);

    return {
      scan: this.mapScanRecord(scan),
      companyCandidates,
      errorMessage,
    };
  }

  async confirmScan(
    input: ConfirmBusinessCardScanInput
  ): Promise<BusinessCardConfirmRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const scan = await transaction.businessCardScan.findFirst({
        where: { id: input.scanId, userId: input.userId },
      });

      if (!scan) {
        throw new BusinessCardScanNotFoundError();
      }

      if (scan.status === PrismaBusinessCardScanStatus.CONFIRMED) {
        throw new BusinessCardAlreadyConfirmedError();
      }

      if (scan.status !== PrismaBusinessCardScanStatus.OCR_COMPLETED) {
        throw new InvalidBusinessCardConfirmationError(
          "OCR result is not ready to confirm"
        );
      }

      const company = await this.resolveCompany(transaction, input);
      const contact = await transaction.contact.create({
        data: {
          userId: input.userId,
          companyId: company?.id ?? null,
          name: input.contactName,
          department: input.department,
          position: input.position,
          phone: input.phone,
          email: input.email,
          location: input.address,
        },
        include: { company: { select: { name: true } } },
      });

      await transaction.businessCardScan.update({
        where: { id: scan.id },
        data: {
          status: PrismaBusinessCardScanStatus.CONFIRMED,
          companyId: company?.id ?? null,
          contactId: contact.id,
          confirmedAt: new Date(),
          extractedCompany: input.companyName,
          extractedName: input.contactName,
          extractedDepartment: input.department,
          extractedPosition: input.position,
          extractedPhone: input.phone,
          extractedEmail: input.email,
          extractedAddress: input.address,
        },
      });

      return {
        company: company ? this.mapCompanyRecord(company) : null,
        contact: this.mapContactRecord(contact),
      };
    });
  }

  private async resolveCompany(
    client: BusinessCardPrismaClient,
    input: ConfirmBusinessCardScanInput
  ): Promise<CompanyRow | null> {
    if (input.companyMode === "NONE") {
      return null;
    }

    if (input.companyMode === "EXISTING") {
      return this.assertCompany(client, input.userId, input.companyId ?? "");
    }

    const company = await client.company.create({
      data: {
        userId: input.userId,
        name: input.companyName ?? "",
        metadata: toCompanyMetadataJson(input.address, null),
      },
    });

    return company;
  }

  private async assertCompany(
    client: BusinessCardPrismaClient,
    userId: string,
    companyId: string
  ): Promise<CompanyRow> {
    const company = await client.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    if (company.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (company.deletedAt) {
      throw new DeletedResourceError("write");
    }

    return company;
  }

  private async listCompanyCandidates(
    userId: string,
    extractedCompany: string | null
  ): Promise<BusinessCardCompanyCandidateRecord[]> {
    if (!extractedCompany) {
      return [];
    }

    const companies = await this.prismaService.company.findMany({
      where: {
        userId,
        deletedAt: null,
        name: { contains: extractedCompany, mode: "insensitive" },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      region: company.location,
    }));
  }

  private async getLatestOcrError(
    userId: string,
    scanId: string
  ): Promise<string | null> {
    const aiJob = await this.prismaService.aiJob.findFirst({
      where: {
        userId,
        targetType: "BusinessCardScan",
        targetId: scanId,
        type: AiJobType.BUSINESS_CARD_OCR,
      },
      orderBy: { createdAt: "desc" },
    });

    return aiJob?.errorMessage ?? null;
  }

  private mapScanRecord(scan: BusinessCardScanRow): BusinessCardScanRecord {
    return {
      id: scan.id,
      userId: scan.userId,
      companyId: scan.companyId,
      contactId: scan.contactId,
      status: scan.status,
      image: {
        bucket: scan.imageBucket,
        objectKey: scan.imageObjectKey,
        contentType: scan.imageContentType,
        sizeBytes: scan.imageSizeBytes,
      },
      extracted: {
        companyName: scan.extractedCompany,
        contactName: scan.extractedName,
        department: scan.extractedDepartment,
        position: scan.extractedPosition,
        phone: scan.extractedPhone,
        email: scan.extractedEmail,
        address: scan.extractedAddress,
      },
      confirmedAt: scan.confirmedAt,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt,
    };
  }

  private mapCompanyRecord(company: CompanyRow): BusinessCardCompanyRecord {
    const metadata = fromCompanyMetadataJson(company.metadata);

    return {
      id: company.id,
      name: company.name,
      industry: company.industry,
      region: company.location,
      address: metadata.address,
      website: metadata.website,
      description: company.description,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
      permanentDeleteAt: company.permanentDeleteAt,
    };
  }

  private mapContactRecord(contact: ContactRow): BusinessCardContactRecord {
    return {
      id: contact.id,
      name: contact.name,
      companyId: contact.companyId,
      companyName: contact.company?.name ?? null,
      department: contact.department,
      position: contact.position,
      phone: contact.phone,
      email: contact.email,
      address: contact.location,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      deletedAt: contact.deletedAt,
      permanentDeleteAt: contact.permanentDeleteAt,
    };
  }
}

function toJsonObject(value: Record<string, unknown>): Prisma.JsonObject {
  return value as Prisma.JsonObject;
}

function toCompanyMetadataJson(
  address: string | null,
  website: string | null
): Prisma.JsonObject {
  return { address, website };
}

function fromCompanyMetadataJson(metadata: Prisma.JsonValue | null): {
  readonly address: string | null;
  readonly website: string | null;
} {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { address: null, website: null };
  }

  const record = metadata as Record<string, unknown>;

  return {
    address: typeof record.address === "string" ? record.address : null,
    website: typeof record.website === "string" ? record.website : null,
  };
}
