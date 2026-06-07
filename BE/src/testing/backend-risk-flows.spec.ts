import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { PrismaAdminSensitiveRepository } from "@/modules/admin/infrastructure/persistence/prisma-admin-sensitive.repository";
import {
  type DealDetailRecord,
  type DealRecord,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import { ChangeDealStageUseCase } from "@/modules/deal/application/use-cases/change-deal-stage.use-case";
import { GetDealUseCase } from "@/modules/deal/application/use-cases/get-deal.use-case";
import { DealNotFoundError } from "@/modules/deal/domain/deal.errors";
import {
  type MeetingNoteRecord,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { LinkMeetingNoteToDealUseCase } from "@/modules/meeting-note/application/use-cases/link-meeting-note-to-deal.use-case";
import type { TrashRepository } from "@/modules/trash/application/ports/trash.repository";
import { RestoreTrashItemUseCase } from "@/modules/trash/application/use-cases/restore-trash-item.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";

describe("Backend risk flows", () => {
  it("does not leak another user's deal through detail reads", async () => {
    const repository = {
      getDealDetail: jest.fn(async (userId: string) =>
        userId === "owner-1" ? createDealDetail({ userId }) : null
      ),
    } as unknown as DealRepository;
    const useCase = new GetDealUseCase(repository);

    await expect(
      useCase.execute(currentUser({ id: "other-1" }), "deal-1")
    ).rejects.toBeInstanceOf(DealNotFoundError);
    expect(repository.getDealDetail).toHaveBeenCalledWith("other-1", "deal-1");
  });

  it("blocks non-admin users at AdminGuard", () => {
    const guard = new AdminGuard();

    expect(() => guard.canActivate(createAdminGuardContext("USER"))).toThrow(
      ForbiddenException
    );
  });

  it("passes deal stage changes through the activity-log repository path", async () => {
    const repository = {
      changeDealStage: jest.fn(async (input) =>
        createDealRecord({
          id: input.dealId,
          userId: input.userId,
          stage: input.stage,
        })
      ),
    } as unknown as DealRepository;
    const useCase = new ChangeDealStageUseCase(repository);

    await useCase.execute(currentUser({ id: "owner-1" }), "deal-1", {
      stage: "WON",
      activityTitle: "  수주 확정  ",
      activityContent: "  계약 완료  ",
    });

    expect(repository.changeDealStage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        dealId: "deal-1",
        stage: "WON",
        activityTitle: "수주 확정",
        activityContent: "계약 완료",
      })
    );
  });

  it("links meeting notes to deals through the activity-log repository path", async () => {
    const repository = {
      linkMeetingNoteToDeal: jest.fn(async (input) =>
        createMeetingNoteRecord({
          id: input.meetingNoteId,
          userId: input.userId,
          dealId: input.dealId,
          dealTitle: "도입 논의",
        })
      ),
    } as unknown as MeetingNoteRepository;
    const useCase = new LinkMeetingNoteToDealUseCase(repository);

    await useCase.execute(currentUser({ id: "owner-1" }), "meeting-note-1", {
      dealId: "  deal-1  ",
      activityTitle: "  회의록 연결  ",
    });

    expect(repository.linkMeetingNoteToDeal).toHaveBeenCalledWith({
      userId: "owner-1",
      meetingNoteId: "meeting-note-1",
      dealId: "deal-1",
      activityTitle: "회의록 연결",
    });
  });

  it("creates sensitive raw audit log inside a transaction before decrypting", async () => {
    const order: string[] = [];
    const tx = {
      personalMemo: {
        findUnique: jest.fn().mockResolvedValue({
          id: "memo-1",
          userId: "owner-1",
          contentCiphertext: "ciphertext",
          contentKeyVersion: "v1",
        }),
      },
      auditLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          order.push("audit");
          expect(data).toMatchObject({
            action: "ADMIN_SENSITIVE_RAW_VIEW",
            targetType: "PERSONAL_MEMO",
            targetId: "memo-1",
            targetUserId: "owner-1",
            metadata: { fields: ["content"] },
          });

          return {
            id: "audit-1",
            createdAt: new Date("2026-06-07T00:00:00.000Z"),
          };
        }),
      },
    };
    const prismaService = {
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const encryptionPort = {
      decryptText: jest.fn().mockImplementation(async () => {
        order.push("decrypt");

        return "원문";
      }),
    } as unknown as EncryptionPort;
    const repository = new PrismaAdminSensitiveRepository(
      prismaService as never,
      encryptionPort
    );

    await repository.viewRawData({
      actorUserId: "admin-1",
      targetType: "PERSONAL_MEMO",
      targetId: "memo-1",
      fields: ["content"],
      reason: "고객 지원 요청으로 메모 확인",
      ipAddress: null,
      userAgent: null,
    });

    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["audit", "decrypt"]);
  });

  it("restores trash only for the current user's target", async () => {
    const repository = {
      restoreTrashItem: jest.fn(async (input) => ({
        targetType: input.targetType,
        targetId: input.targetId,
        restoredAt: input.now,
        resource: { id: input.targetId, userId: input.userId },
      })),
    } as unknown as TrashRepository;
    const useCase = new RestoreTrashItemUseCase(repository);

    await useCase.execute(currentUser({ id: "owner-1" }), "deal", "deal-1");

    expect(repository.restoreTrashItem).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        targetType: "DEAL",
        targetId: "deal-1",
      })
    );
  });
});

function currentUser(
  overrides: Partial<CurrentUserContext> = {}
): CurrentUserContext {
  return {
    id: overrides.id ?? "owner-1",
    sessionId: overrides.sessionId ?? "session-1",
    email: overrides.email ?? "owner@example.com",
    displayName: overrides.displayName ?? "Owner",
    role: overrides.role ?? "USER",
    status: overrides.status ?? "ACTIVE",
  };
}

function createAdminGuardContext(
  role: CurrentUserContext["role"]
): ExecutionContext {
  const request = { currentUser: currentUser({ role }) };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

function createDealDetail(
  overrides: Partial<DealRecord> = {}
): DealDetailRecord {
  const deal = createDealRecord(overrides);

  return {
    deal,
    products: [],
    activities: [],
    memos: [],
    schedulesSummary: { totalCount: 0, upcomingCount: 0 },
    meetingNotesSummary: { totalCount: 0, latestMeetingAt: null },
  };
}

function createDealRecord(overrides: Partial<DealRecord> = {}): DealRecord {
  const now = new Date("2026-06-07T00:00:00.000Z");

  return {
    id: overrides.id ?? "deal-1",
    userId: overrides.userId ?? "owner-1",
    title: overrides.title ?? "도입 논의",
    companyId: overrides.companyId ?? null,
    companyName: overrides.companyName ?? null,
    contactId: overrides.contactId ?? null,
    contactName: overrides.contactName ?? null,
    amount: overrides.amount ?? 1000,
    currency: overrides.currency ?? "KRW",
    stage: overrides.stage ?? "INITIAL_CONTACT",
    likelihoodStatus: overrides.likelihoodStatus ?? "NEUTRAL",
    likelihoodPercent: overrides.likelihoodPercent ?? null,
    expectedCloseDate: overrides.expectedCloseDate ?? null,
    nextActionText: overrides.nextActionText ?? null,
    nextActionDueAt: overrides.nextActionDueAt ?? null,
    nextActionStatus: overrides.nextActionStatus ?? "NONE",
    memoSummary: overrides.memoSummary ?? {
      hasMemo: false,
      memoCount: 0,
      latestMemoAt: null,
    },
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    deletedAt: overrides.deletedAt ?? null,
    permanentDeleteAt: overrides.permanentDeleteAt ?? null,
  };
}

function createMeetingNoteRecord(
  overrides: Partial<MeetingNoteRecord> = {}
): MeetingNoteRecord {
  const now = new Date("2026-06-07T00:00:00.000Z");

  return {
    id: overrides.id ?? "meeting-note-1",
    userId: overrides.userId ?? "owner-1",
    dealId: overrides.dealId ?? null,
    dealTitle: overrides.dealTitle ?? null,
    meetingDate: overrides.meetingDate ?? now,
    companyName: overrides.companyName ?? "에이컴",
    contactName: overrides.contactName ?? "최담당",
    department: overrides.department ?? null,
    productName: overrides.productName ?? null,
    stageText: overrides.stageText ?? null,
    details: overrides.details ?? "상담 내용",
    nextPlan: overrides.nextPlan ?? null,
    requiredAction: overrides.requiredAction ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    deletedAt: overrides.deletedAt ?? null,
    permanentDeleteAt: overrides.permanentDeleteAt ?? null,
  };
}
