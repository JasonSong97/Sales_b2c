import {
  AiJobStatus,
  AiJobType,
  Prisma,
} from "@prisma/client";
import {
  type AiJobRecord,
  type CompleteAiJobInput,
  type CreateAiJobInput,
  type CreateMeetingNoteInput,
  type DeleteResultRecord,
  type FailAiJobInput,
  type GeneratedMeetingNoteFields,
  type LinkMeetingNoteToDealInput,
  type ListMeetingNotesInput,
  type MeetingNoteDetailRecord,
  type MeetingNoteRecord,
  MeetingNoteRepository,
  type PaginatedResult,
  type UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  DealNotFoundError,
  MeetingNoteNotFoundError,
  OwnershipViolationError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MeetingNotePrismaClient = PrismaService | Prisma.TransactionClient;

type MeetingNoteRow = {
  readonly id: string;
  readonly userId: string;
  readonly dealId: string | null;
  readonly meetingDate: Date | null;
  readonly companyName: string | null;
  readonly contactName: string | null;
  readonly department: string | null;
  readonly productName: string | null;
  readonly stageText: string | null;
  readonly details: string | null;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly rawTextCiphertext: string;
  readonly rawTextKeyVersion: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
  readonly deal?: { readonly id: string; readonly title: string } | null;
};

type DealRow = {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly deletedAt: Date | null;
};

const MEETING_NOTE_ACTIVITY_TYPE_NAME = "회의록";

export class PrismaMeetingNoteRepository implements MeetingNoteRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async listMeetingNotes(
    input: ListMeetingNotesInput
  ): Promise<PaginatedResult<MeetingNoteRecord>> {
    if (input.dealId) {
      await this.assertDeal(this.prismaService, input.userId, input.dealId, "read");
    }

    const where = this.createMeetingNoteWhere(input);
    const [meetingNotes, totalCount] = await Promise.all([
      this.prismaService.meetingNote.findMany({
        where,
        include: { deal: { select: { id: true, title: true } } },
        orderBy: [{ meetingDate: "desc" }, { createdAt: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.meetingNote.count({ where }),
    ]);

    return {
      items: meetingNotes.map((meetingNote) =>
        this.mapMeetingNoteRecord(meetingNote)
      ),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createMeetingNote(
    input: CreateMeetingNoteInput
  ): Promise<MeetingNoteRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const deal = input.dealId
        ? await this.assertDeal(transaction, input.userId, input.dealId, "write")
        : null;
      const encrypted = await this.encryptionPort.encryptText(input.rawText);
      const meetingNote = await transaction.meetingNote.create({
        data: {
          userId: input.userId,
          dealId: deal?.id ?? null,
          meetingDate: input.meetingDate,
          companyName: input.companyName,
          contactName: input.contactName,
          department: input.department,
          productName: input.productName,
          stageText: input.stageText,
          details: input.details,
          nextPlan: input.nextPlan,
          requiredAction: input.requiredAction,
          rawTextCiphertext: encrypted.ciphertext,
          rawTextKeyVersion: encrypted.keyVersion,
        },
        include: { deal: { select: { id: true, title: true } } },
      });

      if (deal) {
        await this.createDealActivity(transaction, {
          userId: input.userId,
          dealId: deal.id,
          title: `회의록 저장: ${input.details.slice(0, 80)}`,
          content: input.requiredAction,
        });
      }

      return this.mapMeetingNoteRecord(meetingNote);
    });
  }

  async getMeetingNoteDetail(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteDetailRecord | null> {
    const meetingNote = await this.prismaService.meetingNote.findFirst({
      where: { id: meetingNoteId, userId },
      include: { deal: { select: { id: true, title: true } } },
    });

    if (!meetingNote) {
      return null;
    }

    const rawText = meetingNote.deletedAt
      ? ""
      : await this.encryptionPort.decryptText({
          ciphertext: meetingNote.rawTextCiphertext,
          keyVersion: meetingNote.rawTextKeyVersion,
        });

    return {
      meetingNote: this.mapMeetingNoteRecord(meetingNote),
      deal: meetingNote.deal
        ? { id: meetingNote.deal.id, title: meetingNote.deal.title }
        : null,
      rawText,
    };
  }

  async updateMeetingNote(
    input: UpdateMeetingNoteInput
  ): Promise<MeetingNoteRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      await this.assertMeetingNoteExists(
        transaction,
        input.userId,
        input.meetingNoteId,
        "write"
      );
      const data: Prisma.MeetingNoteUpdateInput = {};

      if (input.rawText !== undefined) {
        const encrypted = await this.encryptionPort.encryptText(input.rawText);
        data.rawTextCiphertext = encrypted.ciphertext;
        data.rawTextKeyVersion = encrypted.keyVersion;
      }

      if (input.dealId !== undefined) {
        const deal = input.dealId
          ? await this.assertDeal(transaction, input.userId, input.dealId, "write")
          : null;
        data.deal = deal ? { connect: { id: deal.id } } : { disconnect: true };
      }

      setOptionalField(data, "meetingDate", input.meetingDate);
      setOptionalField(data, "companyName", input.companyName);
      setOptionalField(data, "contactName", input.contactName);
      setOptionalField(data, "department", input.department);
      setOptionalField(data, "productName", input.productName);
      setOptionalField(data, "stageText", input.stageText);
      setOptionalField(data, "details", input.details);
      setOptionalField(data, "nextPlan", input.nextPlan);
      setOptionalField(data, "requiredAction", input.requiredAction);

      const meetingNote = await transaction.meetingNote.update({
        where: { id: input.meetingNoteId },
        data,
        include: { deal: { select: { id: true, title: true } } },
      });

      return this.mapMeetingNoteRecord(meetingNote);
    });
  }

  async linkMeetingNoteToDeal(
    input: LinkMeetingNoteToDealInput
  ): Promise<MeetingNoteRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const existing = await this.assertMeetingNoteExists(
        transaction,
        input.userId,
        input.meetingNoteId,
        "write"
      );
      const deal = await this.assertDeal(
        transaction,
        input.userId,
        input.dealId,
        "write"
      );
      const meetingNote = await transaction.meetingNote.update({
        where: { id: existing.id },
        data: { dealId: deal.id },
        include: { deal: { select: { id: true, title: true } } },
      });

      await this.createDealActivity(transaction, {
        userId: input.userId,
        dealId: deal.id,
        title: input.activityTitle ?? `회의록 연결: ${meetingNote.details ?? "내용 없음"}`,
        content: meetingNote.requiredAction,
      });

      return this.mapMeetingNoteRecord(meetingNote);
    });
  }

  async deleteMeetingNote(
    userId: string,
    meetingNoteId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const meetingNote = await this.prismaService.meetingNote.findFirst({
      where: { id: meetingNoteId, userId },
    });

    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    if (meetingNote.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.meetingNote.update({
      where: { id: meetingNoteId },
      data: { deletedAt: now, permanentDeleteAt },
    });

    return { id: meetingNoteId, deletedAt: now, permanentDeleteAt };
  }

  async restoreMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord> {
    const meetingNote = await this.prismaService.meetingNote.findFirst({
      where: { id: meetingNoteId, userId },
    });

    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    const restored = await this.prismaService.meetingNote.update({
      where: { id: meetingNoteId },
      data: { deletedAt: null, permanentDeleteAt: null },
      include: { deal: { select: { id: true, title: true } } },
    });

    return this.mapMeetingNoteRecord(restored);
  }

  async createAiJob(input: CreateAiJobInput): Promise<AiJobRecord> {
    const aiJob = await this.prismaService.aiJob.create({
      data: {
        userId: input.userId,
        type: AiJobType.MEETING_NOTE_GENERATION,
        status: AiJobStatus.PROCESSING,
        startedAt: new Date(),
        inputSummary: {
          rawTextLength: input.rawText.length,
        },
      },
    });

    return { id: aiJob.id };
  }

  async completeAiJob(input: CompleteAiJobInput): Promise<void> {
    await this.prismaService.aiJob.updateMany({
      where: { id: input.aiJobId, userId: input.userId },
      data: {
        status: AiJobStatus.COMPLETED,
        output: toAiJobOutput(input.output),
        completedAt: new Date(),
      },
    });
  }

  async failAiJob(input: FailAiJobInput): Promise<void> {
    await this.prismaService.aiJob.updateMany({
      where: { id: input.aiJobId, userId: input.userId },
      data: {
        status: AiJobStatus.FAILED,
        errorMessage: input.errorMessage,
        completedAt: new Date(),
      },
    });
  }

  private createMeetingNoteWhere(
    input: ListMeetingNotesInput
  ): Prisma.MeetingNoteWhereInput {
    return {
      userId: input.userId,
      ...(input.dealId ? { dealId: input.dealId } : {}),
      ...(input.includeDeleted ? {} : { deletedAt: null }),
      ...(input.search
        ? {
            OR: [
              { companyName: { contains: input.search, mode: "insensitive" } },
              { contactName: { contains: input.search, mode: "insensitive" } },
              { productName: { contains: input.search, mode: "insensitive" } },
              { stageText: { contains: input.search, mode: "insensitive" } },
              { details: { contains: input.search, mode: "insensitive" } },
              { nextPlan: { contains: input.search, mode: "insensitive" } },
              { requiredAction: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async assertMeetingNoteExists(
    client: MeetingNotePrismaClient,
    userId: string,
    meetingNoteId: string,
    operation: "read" | "write"
  ): Promise<MeetingNoteRow> {
    const meetingNote = await client.meetingNote.findFirst({
      where: { id: meetingNoteId, userId },
      include: { deal: { select: { id: true, title: true } } },
    });

    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    if (meetingNote.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return meetingNote;
  }

  private async assertDeal(
    client: MeetingNotePrismaClient,
    userId: string,
    dealId: string,
    operation: "read" | "write"
  ): Promise<DealRow> {
    const deal = await client.deal.findUnique({
      where: { id: dealId },
      select: { id: true, userId: true, title: true, deletedAt: true },
    });

    if (!deal) {
      throw new DealNotFoundError();
    }

    if (deal.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (deal.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return deal;
  }

  private async createDealActivity(
    client: MeetingNotePrismaClient,
    input: {
      readonly userId: string;
      readonly dealId: string;
      readonly title: string;
      readonly content: string | null;
    }
  ): Promise<void> {
    const typeId = await this.findOrCreateSystemActivityType(
      client,
      MEETING_NOTE_ACTIVITY_TYPE_NAME
    );
    await client.dealActivity.create({
      data: {
        userId: input.userId,
        dealId: input.dealId,
        typeId,
        activityDate: new Date(),
        title: input.title,
        content: input.content,
        isAutoGenerated: true,
      },
    });
  }

  private async findOrCreateSystemActivityType(
    client: MeetingNotePrismaClient,
    name: string
  ): Promise<string> {
    const existing = await client.dealActivityType.findFirst({
      where: { userId: null, name },
      orderBy: { createdAt: "asc" },
    });

    if (existing) {
      return existing.id;
    }

    const type = await client.dealActivityType.create({
      data: { name, isSystem: true },
    });

    return type.id;
  }

  private mapMeetingNoteRecord(meetingNote: MeetingNoteRow): MeetingNoteRecord {
    return {
      id: meetingNote.id,
      userId: meetingNote.userId,
      meetingDate: meetingNote.meetingDate,
      companyName: meetingNote.companyName,
      contactName: meetingNote.contactName,
      department: meetingNote.department,
      productName: meetingNote.productName,
      stageText: meetingNote.stageText,
      details: meetingNote.details ?? "",
      nextPlan: meetingNote.nextPlan,
      requiredAction: meetingNote.requiredAction,
      dealId: meetingNote.dealId,
      dealTitle: meetingNote.deal?.title ?? null,
      createdAt: meetingNote.createdAt,
      updatedAt: meetingNote.updatedAt,
      deletedAt: meetingNote.deletedAt,
      permanentDeleteAt: meetingNote.permanentDeleteAt,
    };
  }
}

function setOptionalField<TValue>(
  data: Prisma.MeetingNoteUpdateInput,
  field: keyof Pick<
    Prisma.MeetingNoteUpdateInput,
    | "meetingDate"
    | "companyName"
    | "contactName"
    | "department"
    | "productName"
    | "stageText"
    | "details"
    | "nextPlan"
    | "requiredAction"
  >,
  value: TValue | undefined
) {
  if (value !== undefined) {
    data[field] = value as never;
  }
}

function toAiJobOutput(fields: GeneratedMeetingNoteFields): Prisma.JsonObject {
  return {
    meetingDate: fields.meetingDate?.toISOString() ?? null,
    companyName: fields.companyName,
    contactName: fields.contactName,
    department: fields.department,
    productName: fields.productName,
    stageText: fields.stageText,
    details: fields.details,
    nextPlan: fields.nextPlan,
    requiredAction: fields.requiredAction,
  };
}
