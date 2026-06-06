import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
  ScheduleSource as PrismaScheduleSource,
} from "@prisma/client";
import {
  type CreateScheduleInput,
  type DeleteResultRecord,
  type ListSchedulesInput,
  type ScheduleDetailRecord,
  type ScheduleListResult,
  type ScheduleRecord,
  ScheduleRepository,
  type ScheduleReminderRecord,
  type UpdateScheduleInput,
} from "@/modules/schedule/application/ports/schedule.repository";
import {
  OwnershipViolationError,
  RelatedEntityNotFoundError,
  ScheduleNotFoundError,
} from "@/modules/schedule/domain/schedule.errors";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type SchedulePrismaClient = PrismaService | Prisma.TransactionClient;

type ScheduleRow = {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly dealId: string | null;
  readonly title: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly memo: string | null;
  readonly source: PrismaScheduleSource;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
  readonly deal?: { readonly id: string; readonly title: string } | null;
  readonly company?: { readonly id: string; readonly name: string } | null;
  readonly contact?: { readonly id: string; readonly name: string } | null;
  readonly reminders?: ScheduleReminderRow[];
};

type ScheduleReminderRow = {
  readonly id: string;
  readonly channel: NotificationChannel;
  readonly remindAt: Date;
  readonly sentAt: Date | null;
  readonly status: NotificationStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type CompanyRecord = {
  readonly id: string;
  readonly userId: string;
  readonly deletedAt: Date | null;
};

type ContactRecord = {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly deletedAt: Date | null;
};

type DealRecord = {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly deletedAt: Date | null;
};

type ResolvedRelations = {
  readonly dealId: string | null;
  readonly companyId: string | null;
  readonly contactId: string | null;
};

export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listSchedules(input: ListSchedulesInput): Promise<ScheduleListResult> {
    const relations = await this.resolveRelations(this.prismaService, input.userId, {
      dealId: input.dealId,
      companyId: input.companyId,
      contactId: input.contactId,
    }, "read");
    const where = this.createScheduleWhere(input, relations);
    const schedules = await this.prismaService.schedule.findMany({
      where,
      include: this.scheduleInclude(),
      orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
    });

    return {
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      items: schedules.map((schedule) => this.mapScheduleRecord(schedule)),
    };
  }

  async createSchedule(input: CreateScheduleInput): Promise<ScheduleRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const relations = await this.resolveRelations(transaction, input.userId, {
        dealId: input.dealId,
        companyId: input.companyId,
        contactId: input.contactId,
      }, "write");
      const schedule = await transaction.schedule.create({
        data: {
          userId: input.userId,
          dealId: relations.dealId,
          companyId: relations.companyId,
          contactId: relations.contactId,
          title: input.title,
          startAt: input.startAt,
          endAt: input.endAt,
          allDay: input.allDay,
          location: input.location,
          memo: input.memo,
          source: PrismaScheduleSource.INTERNAL,
        },
        include: this.scheduleInclude(),
      });

      await this.replaceReminders(transaction, {
        userId: input.userId,
        scheduleId: schedule.id,
        startAt: input.startAt,
        reminderMinutes: input.reminderMinutes,
      });

      return this.getRequiredScheduleRecord(transaction, input.userId, schedule.id);
    });
  }

  async getScheduleDetail(
    userId: string,
    scheduleId: string
  ): Promise<ScheduleDetailRecord | null> {
    const schedule = await this.prismaService.schedule.findFirst({
      where: { id: scheduleId, userId },
      include: this.scheduleInclude(),
    });

    if (!schedule) {
      return null;
    }

    const record = this.mapScheduleRecord(schedule);

    return {
      schedule: record,
      deal: schedule.deal
        ? { id: schedule.deal.id, title: schedule.deal.title }
        : null,
      company: schedule.company
        ? { id: schedule.company.id, name: schedule.company.name }
        : null,
      contact: schedule.contact
        ? { id: schedule.contact.id, name: schedule.contact.name }
        : null,
      reminders: record.reminders,
    };
  }

  async updateSchedule(input: UpdateScheduleInput): Promise<ScheduleRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const existing = await this.assertScheduleExists(
        input.userId,
        input.scheduleId,
        "write",
        transaction
      );
      const relations =
        input.dealId !== undefined ||
        input.companyId !== undefined ||
        input.contactId !== undefined
          ? await this.resolveRelations(transaction, input.userId, {
              dealId:
                input.dealId !== undefined ? input.dealId : existing.dealId,
              companyId:
                input.companyId !== undefined
                  ? input.companyId
                  : existing.companyId,
              contactId:
                input.contactId !== undefined
                  ? input.contactId
                  : existing.contactId,
            }, "write")
          : null;
      const nextStartAt = input.startAt ?? existing.startAt;
      const nextEndAt = input.endAt ?? existing.endAt;

      if (nextStartAt.getTime() >= nextEndAt.getTime()) {
        throw new ValidationDomainError("Schedule end must be after start");
      }

      const data: Prisma.ScheduleUpdateInput = {};

      if (input.title !== undefined) {
        data.title = input.title;
      }

      if (input.startAt !== undefined) {
        data.startAt = input.startAt;
      }

      if (input.endAt !== undefined) {
        data.endAt = input.endAt;
      }

      if (input.allDay !== undefined) {
        data.allDay = input.allDay;
      }

      if (input.location !== undefined) {
        data.location = input.location;
      }

      if (input.memo !== undefined) {
        data.memo = input.memo;
      }

      if (relations) {
        data.deal = relations.dealId
          ? { connect: { id: relations.dealId } }
          : { disconnect: true };
        data.company = relations.companyId
          ? { connect: { id: relations.companyId } }
          : { disconnect: true };
        data.contact = relations.contactId
          ? { connect: { id: relations.contactId } }
          : { disconnect: true };
      }

      await transaction.schedule.update({
        where: { id: input.scheduleId },
        data,
      });

      if (input.reminderMinutes !== undefined) {
        await this.replaceReminders(transaction, {
          userId: input.userId,
          scheduleId: input.scheduleId,
          startAt: nextStartAt,
          reminderMinutes: input.reminderMinutes,
        });
      }

      return this.getRequiredScheduleRecord(
        transaction,
        input.userId,
        input.scheduleId
      );
    });
  }

  async deleteSchedule(
    userId: string,
    scheduleId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const schedule = await this.prismaService.schedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    if (schedule.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.schedule.update({
      where: { id: scheduleId },
      data: { deletedAt: now, permanentDeleteAt },
    });

    return { id: scheduleId, deletedAt: now, permanentDeleteAt };
  }

  async restoreSchedule(
    userId: string,
    scheduleId: string
  ): Promise<ScheduleRecord> {
    const schedule = await this.prismaService.schedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    await this.prismaService.schedule.update({
      where: { id: scheduleId },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return this.getRequiredScheduleRecord(this.prismaService, userId, scheduleId);
  }

  private createScheduleWhere(
    input: ListSchedulesInput,
    relations: ResolvedRelations
  ): Prisma.ScheduleWhereInput {
    return {
      userId: input.userId,
      deletedAt: null,
      startAt: { lt: input.rangeEnd },
      endAt: { gt: input.rangeStart },
      ...(relations.dealId ? { dealId: relations.dealId } : {}),
      ...(relations.companyId ? { companyId: relations.companyId } : {}),
      ...(relations.contactId ? { contactId: relations.contactId } : {}),
      ...(input.source ? { source: input.source } : {}),
    };
  }

  private async resolveRelations(
    client: SchedulePrismaClient,
    userId: string,
    input: {
      readonly dealId: string | null;
      readonly companyId: string | null;
      readonly contactId: string | null;
    },
    operation: "read" | "write"
  ): Promise<ResolvedRelations> {
    const deal = input.dealId
      ? await this.assertDeal(client, userId, input.dealId, operation)
      : null;
    const contactId = input.contactId ?? deal?.contactId ?? null;
    const contact = contactId
      ? await this.assertContact(client, userId, contactId, operation)
      : null;
    const companyId = input.companyId ?? deal?.companyId ?? contact?.companyId ?? null;
    const company = companyId
      ? await this.assertCompany(client, userId, companyId, operation)
      : null;

    if (company && contact?.companyId && contact.companyId !== company.id) {
      throw new ValidationDomainError("Contact does not belong to the company");
    }

    if (deal?.companyId && companyId && deal.companyId !== companyId) {
      throw new ValidationDomainError("Schedule company does not match deal");
    }

    if (deal?.contactId && contactId && deal.contactId !== contactId) {
      throw new ValidationDomainError("Schedule contact does not match deal");
    }

    return {
      dealId: deal?.id ?? null,
      companyId: company?.id ?? null,
      contactId: contact?.id ?? null,
    };
  }

  private async assertScheduleExists(
    userId: string,
    scheduleId: string,
    operation: "read" | "write",
    client: SchedulePrismaClient = this.prismaService
  ): Promise<ScheduleRow> {
    const schedule = await client.schedule.findFirst({
      where: { id: scheduleId, userId },
      include: this.scheduleInclude(),
    });

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    if (schedule.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return schedule;
  }

  private async assertCompany(
    client: SchedulePrismaClient,
    userId: string,
    companyId: string,
    operation: "read" | "write"
  ): Promise<CompanyRecord> {
    const company = await client.company.findUnique({ where: { id: companyId } });

    if (!company) {
      throw new RelatedEntityNotFoundError();
    }

    if (company.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (company.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return company;
  }

  private async assertContact(
    client: SchedulePrismaClient,
    userId: string,
    contactId: string,
    operation: "read" | "write"
  ): Promise<ContactRecord> {
    const contact = await client.contact.findUnique({ where: { id: contactId } });

    if (!contact) {
      throw new RelatedEntityNotFoundError();
    }

    if (contact.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (contact.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return contact;
  }

  private async assertDeal(
    client: SchedulePrismaClient,
    userId: string,
    dealId: string,
    operation: "read" | "write"
  ): Promise<DealRecord> {
    const deal = await client.deal.findUnique({ where: { id: dealId } });

    if (!deal) {
      throw new RelatedEntityNotFoundError();
    }

    if (deal.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (deal.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return deal;
  }

  private async replaceReminders(
    client: SchedulePrismaClient,
    input: {
      readonly userId: string;
      readonly scheduleId: string;
      readonly startAt: Date;
      readonly reminderMinutes: readonly number[];
    }
  ): Promise<void> {
    await client.scheduleReminder.deleteMany({
      where: { userId: input.userId, scheduleId: input.scheduleId },
    });

    if (input.reminderMinutes.length === 0) {
      return;
    }

    await client.scheduleReminder.createMany({
      data: input.reminderMinutes.map((minutes) => ({
        userId: input.userId,
        scheduleId: input.scheduleId,
        channel: NotificationChannel.EMAIL,
        remindAt: new Date(input.startAt.getTime() - minutes * 60 * 1000),
        status: NotificationStatus.PENDING,
      })),
    });
  }

  private async getRequiredScheduleRecord(
    client: SchedulePrismaClient,
    userId: string,
    scheduleId: string
  ): Promise<ScheduleRecord> {
    const schedule = await client.schedule.findFirst({
      where: { id: scheduleId, userId },
      include: this.scheduleInclude(),
    });

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    return this.mapScheduleRecord(schedule);
  }

  private scheduleInclude() {
    return {
      deal: { select: { id: true, title: true } },
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      reminders: { orderBy: { remindAt: "asc" as const } },
    };
  }

  private mapScheduleRecord(schedule: ScheduleRow): ScheduleRecord {
    return {
      id: schedule.id,
      userId: schedule.userId,
      title: schedule.title,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      allDay: schedule.allDay,
      location: schedule.location,
      memo: schedule.memo,
      source: schedule.source,
      dealId: schedule.dealId,
      dealTitle: schedule.deal?.title ?? null,
      companyId: schedule.companyId,
      companyName: schedule.company?.name ?? null,
      contactId: schedule.contactId,
      contactName: schedule.contact?.name ?? null,
      reminders: (schedule.reminders ?? []).map((reminder) =>
        this.mapReminderRecord(reminder)
      ),
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      deletedAt: schedule.deletedAt,
      permanentDeleteAt: schedule.permanentDeleteAt,
    };
  }

  private mapReminderRecord(
    reminder: ScheduleReminderRow
  ): ScheduleReminderRecord {
    return {
      id: reminder.id,
      channel: reminder.channel,
      remindAt: reminder.remindAt,
      sentAt: reminder.sentAt,
      status: reminder.status,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }
}
