import type { AiMeetingNotePort, GenerateMeetingNoteInput } from "@/modules/meeting-note/application/ports/ai-meeting-note.port";
import type {
  AiJobRecord,
  CompleteAiJobInput,
  CreateAiJobInput,
  CreateMeetingNoteInput,
  DeleteResultRecord,
  FailAiJobInput,
  GeneratedMeetingNoteFields,
  LinkMeetingNoteToDealInput,
  ListMeetingNotesInput,
  MeetingNoteDetailRecord,
  MeetingNoteRecord,
  MeetingNoteRepository,
  PaginatedResult,
  UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { NotificationScheduler } from "@/modules/notification/application/use-cases/notification-scheduler.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { CreateMeetingNoteUseCase } from "./create-meeting-note.use-case";
import { GenerateMeetingNoteUseCase } from "./generate-meeting-note.use-case";
import { GetMeetingNoteUseCase } from "./get-meeting-note.use-case";
import { LinkMeetingNoteToDealUseCase } from "./link-meeting-note-to-deal.use-case";

class FakeMeetingNoteRepository implements MeetingNoteRepository {
  createInput: CreateMeetingNoteInput | null = null;
  linkInput: LinkMeetingNoteToDealInput | null = null;
  createAiJobInput: CreateAiJobInput | null = null;
  completeAiJobInput: CompleteAiJobInput | null = null;
  failAiJobInput: FailAiJobInput | null = null;
  detail: MeetingNoteDetailRecord | null = null;

  async listMeetingNotes(
    input: ListMeetingNotesInput
  ): Promise<PaginatedResult<MeetingNoteRecord>> {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createMeetingNote(
    input: CreateMeetingNoteInput
  ): Promise<MeetingNoteRecord> {
    this.createInput = input;

    return createMeetingNoteRecord({
      userId: input.userId,
      meetingDate: input.meetingDate,
      details: input.details,
      dealId: input.dealId,
    });
  }

  async getMeetingNoteDetail(): Promise<MeetingNoteDetailRecord | null> {
    return this.detail;
  }

  async updateMeetingNote(input: UpdateMeetingNoteInput): Promise<MeetingNoteRecord> {
    return createMeetingNoteRecord({
      id: input.meetingNoteId,
      userId: input.userId,
      details: input.details ?? "회의 요약",
    });
  }

  async linkMeetingNoteToDeal(
    input: LinkMeetingNoteToDealInput
  ): Promise<MeetingNoteRecord> {
    this.linkInput = input;

    return createMeetingNoteRecord({
      id: input.meetingNoteId,
      userId: input.userId,
      dealId: input.dealId,
      dealTitle: "도입 상담",
    });
  }

  async deleteMeetingNote(
    userId: string,
    meetingNoteId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    return {
      id: `${userId}:${meetingNoteId}`,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord> {
    return createMeetingNoteRecord({ id: meetingNoteId, userId });
  }

  async createAiJob(input: CreateAiJobInput): Promise<AiJobRecord> {
    this.createAiJobInput = input;

    return { id: "ai-job-1" };
  }

  async completeAiJob(input: CompleteAiJobInput): Promise<void> {
    this.completeAiJobInput = input;
  }

  async failAiJob(input: FailAiJobInput): Promise<void> {
    this.failAiJobInput = input;
  }
}

class FakeAiMeetingNotePort implements AiMeetingNotePort {
  input: GenerateMeetingNoteInput | null = null;
  fields: GeneratedMeetingNoteFields = createGeneratedFields();
  error: Error | null = null;

  async generateMeetingNote(
    input: GenerateMeetingNoteInput
  ): Promise<GeneratedMeetingNoteFields> {
    this.input = input;

    if (this.error) {
      throw this.error;
    }

    return this.fields;
  }
}

describe("MeetingNote use cases", () => {
  it("normalizes create input and allows saving without a deal", async () => {
    const repository = new FakeMeetingNoteRepository();
    const scheduler = createNotificationScheduler();
    const useCase = new CreateMeetingNoteUseCase(repository, scheduler);

    await useCase.execute(currentUser(), {
      rawText: "  회의 원문  ",
      meetingDate: "2026-06-07T01:00:00.000Z",
      companyName: "  고객사  ",
      details: "  요구사항 정리  ",
      dealId: "   ",
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      rawText: "회의 원문",
      companyName: "고객사",
      details: "요구사항 정리",
      dealId: null,
    });
    expect(repository.createInput?.meetingDate?.toISOString()).toBe(
      "2026-06-07T01:00:00.000Z"
    );
    expect(
      scheduler.createMeetingNoteGeneratedNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        meetingNoteId: "meeting-note-1",
        meetingTitle: "요구사항 정리",
      })
    );
  });

  it("generates fixed meeting note fields and completes the AI job", async () => {
    const repository = new FakeMeetingNoteRepository();
    const aiPort = new FakeAiMeetingNotePort();
    const useCase = new GenerateMeetingNoteUseCase(repository, aiPort);

    const response = await useCase.execute(currentUser(), {
      rawText: "  상담 내용  ",
      meetingDate: "2026-06-07T01:00:00.000Z",
      companyHint: "  고객사  ",
      contactHint: "  홍길동  ",
    });

    expect(repository.createAiJobInput).toMatchObject({
      userId: "user-1",
      rawText: "상담 내용",
    });
    expect(aiPort.input).toMatchObject({
      rawText: "상담 내용",
      companyHint: "고객사",
      contactHint: "홍길동",
    });
    expect(aiPort.input?.meetingDate?.toISOString()).toBe(
      "2026-06-07T01:00:00.000Z"
    );
    expect(repository.completeAiJobInput).toMatchObject({
      userId: "user-1",
      aiJobId: "ai-job-1",
      output: aiPort.fields,
    });
    expect(response.aiJobId).toBe("ai-job-1");
    expect(response.details).toBe("상담 요약");
  });

  it("marks the AI job as failed when generation fails", async () => {
    const repository = new FakeMeetingNoteRepository();
    const aiPort = new FakeAiMeetingNotePort();
    aiPort.error = new Error("provider timeout");
    const useCase = new GenerateMeetingNoteUseCase(repository, aiPort);

    await expect(
      useCase.execute(currentUser(), {
        rawText: "상담 내용",
      })
    ).rejects.toThrow("provider timeout");

    expect(repository.completeAiJobInput).toBeNull();
    expect(repository.failAiJobInput).toMatchObject({
      userId: "user-1",
      aiJobId: "ai-job-1",
      errorMessage: "provider timeout",
    });
  });

  it("passes deal link ownership context and activity title to repository", async () => {
    const repository = new FakeMeetingNoteRepository();
    const useCase = new LinkMeetingNoteToDealUseCase(repository);

    await useCase.execute(currentUser(), "meeting-note-1", {
      dealId: "  deal-1  ",
      activityTitle: "  회의록 연결  ",
    });

    expect(repository.linkInput).toMatchObject({
      userId: "user-1",
      meetingNoteId: "meeting-note-1",
      dealId: "deal-1",
      activityTitle: "회의록 연결",
    });
  });

  it("blocks detail reads for deleted meeting notes", async () => {
    const repository = new FakeMeetingNoteRepository();
    const meetingNote = createMeetingNoteRecord({
      deletedAt: new Date("2026-06-07T01:00:00.000Z"),
    });
    repository.detail = {
      meetingNote,
      deal: null,
      rawText: "회의 원문",
    };
    const useCase = new GetMeetingNoteUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "meeting-note-1")
    ).rejects.toBeInstanceOf(DeletedResourceError);
  });
});

function createNotificationScheduler() {
  return {
    createMeetingNoteGeneratedNotification: jest.fn(),
  } as unknown as NotificationScheduler & {
    readonly createMeetingNoteGeneratedNotification: jest.Mock;
  };
}

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

function createGeneratedFields(
  overrides: Partial<GeneratedMeetingNoteFields> = {}
): GeneratedMeetingNoteFields {
  return {
    meetingDate:
      overrides.meetingDate ?? new Date("2026-06-07T01:00:00.000Z"),
    companyName: overrides.companyName ?? "고객사",
    contactName: overrides.contactName ?? "홍길동",
    department: overrides.department ?? "영업팀",
    productName: overrides.productName ?? "프리미엄 상품",
    stageText: overrides.stageText ?? "상담",
    details: overrides.details ?? "상담 요약",
    nextPlan: overrides.nextPlan ?? "견적서 전달",
    requiredAction: overrides.requiredAction ?? "예산 확인",
  };
}

function createMeetingNoteRecord(
  overrides: Partial<MeetingNoteRecord> = {}
): MeetingNoteRecord {
  const createdAt =
    overrides.createdAt ?? new Date("2026-06-07T01:00:00.000Z");

  return {
    id: overrides.id ?? "meeting-note-1",
    userId: overrides.userId ?? "user-1",
    meetingDate:
      overrides.meetingDate ?? new Date("2026-06-07T01:00:00.000Z"),
    companyName: overrides.companyName ?? "고객사",
    contactName: overrides.contactName ?? "홍길동",
    department: overrides.department ?? "영업팀",
    productName: overrides.productName ?? "프리미엄 상품",
    stageText: overrides.stageText ?? "상담",
    details: overrides.details ?? "상담 요약",
    nextPlan: overrides.nextPlan ?? "견적서 전달",
    requiredAction: overrides.requiredAction ?? "예산 확인",
    dealId: overrides.dealId ?? null,
    dealTitle: overrides.dealTitle ?? null,
    createdAt,
    updatedAt: overrides.updatedAt ?? createdAt,
    deletedAt: overrides.deletedAt ?? null,
    permanentDeleteAt: overrides.permanentDeleteAt ?? null,
  };
}
