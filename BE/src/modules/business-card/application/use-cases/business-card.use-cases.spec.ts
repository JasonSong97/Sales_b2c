import type {
  BusinessCardOcrInput,
  BusinessCardOcrPort,
  BusinessCardOcrResult,
  ExtractedBusinessCardFields,
} from "@/modules/business-card/application/ports/business-card-ocr.port";
import type {
  BusinessCardConfirmRecord,
  BusinessCardRepository,
  BusinessCardScanDetailRecord,
  BusinessCardScanRecord,
  CompleteBusinessCardOcrInput,
  ConfirmBusinessCardScanInput,
  CreateBusinessCardAiJobInput,
  CreateBusinessCardScanInput,
  FailBusinessCardOcrInput,
} from "@/modules/business-card/application/ports/business-card.repository";
import {
  BusinessCardScanNotFoundError,
  InvalidImageFileError,
  OcrProviderUnavailableError,
} from "@/modules/business-card/domain/business-card.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  CreateSignedDownloadUrlInput,
  SignedDownloadUrl,
  StoragePort,
  StoredObject,
  UploadObjectInput,
} from "@/shared/application/ports/storage.port";
import { ConfirmBusinessCardScanUseCase } from "./confirm-business-card-scan.use-case";
import { GetBusinessCardScanUseCase } from "./get-business-card-scan.use-case";
import { ScanBusinessCardUseCase } from "./scan-business-card.use-case";

class FakeBusinessCardRepository implements BusinessCardRepository {
  createScanInput: CreateBusinessCardScanInput | null = null;
  createAiJobInput: CreateBusinessCardAiJobInput | null = null;
  completeOcrInput: CompleteBusinessCardOcrInput | null = null;
  failOcrInput: FailBusinessCardOcrInput | null = null;
  confirmScanInput: ConfirmBusinessCardScanInput | null = null;
  detail: BusinessCardScanDetailRecord | null = null;

  async createScan(
    input: CreateBusinessCardScanInput
  ): Promise<BusinessCardScanRecord> {
    this.createScanInput = input;

    return createScanRecord({
      userId: input.userId,
      image: input.image,
      status: "OCR_PROCESSING",
    });
  }

  async createAiJob(
    input: CreateBusinessCardAiJobInput
  ): Promise<{ readonly id: string }> {
    this.createAiJobInput = input;

    return { id: "ai-job-1" };
  }

  async completeOcr(
    input: CompleteBusinessCardOcrInput
  ): Promise<BusinessCardScanRecord> {
    this.completeOcrInput = input;

    return createScanRecord({
      userId: input.userId,
      id: input.scanId,
      status: "OCR_COMPLETED",
      extracted: input.extracted,
    });
  }

  async failOcr(input: FailBusinessCardOcrInput): Promise<void> {
    this.failOcrInput = input;
  }

  async getScanDetail(): Promise<BusinessCardScanDetailRecord | null> {
    return this.detail;
  }

  async confirmScan(
    input: ConfirmBusinessCardScanInput
  ): Promise<BusinessCardConfirmRecord> {
    this.confirmScanInput = input;

    return {
      company:
        input.companyMode === "NONE"
          ? null
          : {
              id: input.companyId ?? "company-new",
              name: input.companyName ?? "기존 회사",
              industry: null,
              region: null,
              address: input.address,
              website: null,
              description: null,
              createdAt: new Date("2026-06-07T01:00:00.000Z"),
              updatedAt: new Date("2026-06-07T01:00:00.000Z"),
              deletedAt: null,
              permanentDeleteAt: null,
            },
      contact: {
        id: "contact-1",
        name: input.contactName,
        companyId: input.companyId ?? null,
        companyName: input.companyName,
        department: input.department,
        position: input.position,
        phone: input.phone,
        email: input.email,
        address: input.address,
        createdAt: new Date("2026-06-07T01:00:00.000Z"),
        updatedAt: new Date("2026-06-07T01:00:00.000Z"),
        deletedAt: null,
        permanentDeleteAt: null,
      },
    };
  }
}

class FakeBusinessCardOcrPort implements BusinessCardOcrPort {
  input: BusinessCardOcrInput | null = null;
  result: BusinessCardOcrResult = {
    extracted: createExtractedFields(),
    rawOutput: { provider: "fake" },
  };
  error: Error | null = null;

  async extractBusinessCard(
    input: BusinessCardOcrInput
  ): Promise<BusinessCardOcrResult> {
    this.input = input;

    if (this.error) {
      throw this.error;
    }

    return this.result;
  }
}

class FakeStoragePort implements StoragePort {
  uploadInput: UploadObjectInput | null = null;

  async uploadObject(input: UploadObjectInput): Promise<StoredObject> {
    this.uploadInput = input;

    return {
      storageProvider: "supabase",
      bucket: input.bucket,
      objectKey: input.objectKey,
      contentType: input.contentType ?? null,
      sizeBytes:
        input.body instanceof ArrayBuffer ? input.body.byteLength : input.body.byteLength,
      fileName: input.fileName ?? null,
    };
  }

  async createSignedDownloadUrl(
    input: CreateSignedDownloadUrlInput
  ): Promise<SignedDownloadUrl> {
    return {
      url: `https://storage.example/${input.bucket}/${input.objectKey}`,
      expiresInSeconds: input.expiresInSeconds,
    };
  }

  async removeObject(): Promise<void> {
    return undefined;
  }
}

describe("BusinessCard use cases", () => {
  it("uploads an image, runs OCR, and stores extracted fields without creating contacts", async () => {
    const repository = new FakeBusinessCardRepository();
    const ocrPort = new FakeBusinessCardOcrPort();
    const storagePort = new FakeStoragePort();
    const useCase = new ScanBusinessCardUseCase(
      repository,
      ocrPort,
      storagePort,
      "business-card-images"
    );

    const response = await useCase.execute(currentUser(), {
      imageFile: imageFile(),
      memo: "  전시회에서 받은 명함  ",
    });

    expect(storagePort.uploadInput).toMatchObject({
      bucket: "business-card-images",
      contentType: "image/png",
      fileName: "card.png",
    });
    expect(repository.createScanInput).toMatchObject({
      userId: "user-1",
    });
    expect(repository.createAiJobInput).toMatchObject({
      userId: "user-1",
      scanId: "scan-1",
      fileName: "card.png",
      memo: "전시회에서 받은 명함",
    });
    expect(ocrPort.input).toMatchObject({
      image: {
        contentType: "image/png",
        fileName: "card.png",
      },
    });
    expect(repository.completeOcrInput).toMatchObject({
      userId: "user-1",
      scanId: "scan-1",
      aiJobId: "ai-job-1",
      extracted: ocrPort.result.extracted,
    });
    expect(response.status).toBe("OCR_COMPLETED");
  });

  it("rejects invalid images before storage upload", async () => {
    const repository = new FakeBusinessCardRepository();
    const ocrPort = new FakeBusinessCardOcrPort();
    const storagePort = new FakeStoragePort();
    const useCase = new ScanBusinessCardUseCase(
      repository,
      ocrPort,
      storagePort,
      "business-card-images"
    );

    await expect(
      useCase.execute(currentUser(), {
        imageFile: { ...imageFile(), mimetype: "application/pdf" },
      })
    ).rejects.toBeInstanceOf(InvalidImageFileError);
    expect(storagePort.uploadInput).toBeNull();
    expect(repository.createScanInput).toBeNull();
  });

  it("marks the OCR job failed when provider extraction fails", async () => {
    const repository = new FakeBusinessCardRepository();
    const ocrPort = new FakeBusinessCardOcrPort();
    ocrPort.error = new Error("provider timeout");
    const storagePort = new FakeStoragePort();
    const useCase = new ScanBusinessCardUseCase(
      repository,
      ocrPort,
      storagePort,
      "business-card-images"
    );

    await expect(
      useCase.execute(currentUser(), { imageFile: imageFile() })
    ).rejects.toBeInstanceOf(OcrProviderUnavailableError);

    expect(repository.failOcrInput).toMatchObject({
      userId: "user-1",
      scanId: "scan-1",
      aiJobId: "ai-job-1",
      errorMessage: "provider timeout",
    });
    expect(repository.completeOcrInput).toBeNull();
  });

  it("returns scan detail with company candidates", async () => {
    const repository = new FakeBusinessCardRepository();
    repository.detail = {
      scan: createScanRecord({ status: "OCR_COMPLETED" }),
      companyCandidates: [
        { id: "company-1", name: "한빛리빙", industry: "생활가전", region: "서울" },
      ],
      errorMessage: null,
    };
    const useCase = new GetBusinessCardScanUseCase(repository);

    const response = await useCase.execute(currentUser(), "scan-1");

    expect(response.scanId).toBe("scan-1");
    expect(response.extracted.companyName).toBe("한빛리빙");
    expect(response.companyCandidates[0]?.name).toBe("한빛리빙");
  });

  it("rejects missing scan details", async () => {
    const repository = new FakeBusinessCardRepository();
    const useCase = new GetBusinessCardScanUseCase(repository);

    await expect(useCase.execute(currentUser(), "missing")).rejects.toBeInstanceOf(
      BusinessCardScanNotFoundError
    );
  });

  it("normalizes confirmation input before creating company and contact", async () => {
    const repository = new FakeBusinessCardRepository();
    const useCase = new ConfirmBusinessCardScanUseCase(repository);

    const response = await useCase.execute(currentUser(), "scan-1", {
      companyMode: "NEW",
      companyName: "  한빛리빙  ",
      contactName: "  김서연  ",
      department: "  구매팀  ",
      position: "  매니저  ",
      phone: "  010-0000-0000  ",
      email: "  buyer@example.com  ",
      address: "  서울시 강남구  ",
    });

    expect(repository.confirmScanInput).toMatchObject({
      userId: "user-1",
      scanId: "scan-1",
      companyMode: "NEW",
      companyName: "한빛리빙",
      contactName: "김서연",
      department: "구매팀",
      position: "매니저",
      phone: "010-0000-0000",
      email: "buyer@example.com",
      address: "서울시 강남구",
    });
    expect(response.company?.name).toBe("한빛리빙");
    expect(response.contact.name).toBe("김서연");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "사용자",
    role: "USER",
    status: "ACTIVE",
  };
}

function imageFile() {
  return {
    buffer: Buffer.from("fake-image"),
    mimetype: "image/png",
    originalname: "card.png",
    size: Buffer.byteLength("fake-image"),
  };
}

function createExtractedFields(
  overrides: Partial<ExtractedBusinessCardFields> = {}
): ExtractedBusinessCardFields {
  return {
    companyName: overrides.companyName ?? "한빛리빙",
    contactName: overrides.contactName ?? "김서연",
    department: overrides.department ?? "구매팀",
    position: overrides.position ?? "매니저",
    phone: overrides.phone ?? "010-0000-0000",
    email: overrides.email ?? "buyer@example.com",
    address: overrides.address ?? "서울시 강남구",
  };
}

function createScanRecord(
  overrides: Partial<BusinessCardScanRecord> = {}
): BusinessCardScanRecord {
  const createdAt =
    overrides.createdAt ?? new Date("2026-06-07T01:00:00.000Z");

  return {
    id: overrides.id ?? "scan-1",
    userId: overrides.userId ?? "user-1",
    companyId: overrides.companyId ?? null,
    contactId: overrides.contactId ?? null,
    status: overrides.status ?? "OCR_PROCESSING",
    image: overrides.image ?? {
      bucket: "business-card-images",
      objectKey: "business-cards/user-1/card.png",
      contentType: "image/png",
      sizeBytes: 10,
    },
    extracted: overrides.extracted ?? createExtractedFields(),
    confirmedAt: overrides.confirmedAt ?? null,
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
  };
}
