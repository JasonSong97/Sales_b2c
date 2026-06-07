import { DealStage, type Prisma } from "@prisma/client";
import {
  type SearchAllInput,
  type SearchItemRecord,
  type SearchRepository,
  type SearchTargetType,
} from "@/modules/search/application/ports/search.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

export class PrismaSearchRepository implements SearchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async searchAll(input: SearchAllInput) {
    const groups = await Promise.all(
      input.types.map(async (type) => ({
        type,
        items: await this.searchByType(type, input),
      }))
    );

    return { groups };
  }

  private searchByType(
    type: SearchTargetType,
    input: SearchAllInput
  ): Promise<SearchItemRecord[]> {
    switch (type) {
      case "COMPANY":
        return this.searchCompanies(input);
      case "CONTACT":
        return this.searchContacts(input);
      case "PRODUCT":
        return this.searchProducts(input);
      case "DEAL":
        return this.searchDeals(input);
      case "SCHEDULE":
        return this.searchSchedules(input);
      case "MEETING_NOTE":
        return this.searchMeetingNotes(input);
    }
  }

  private async searchCompanies(input: SearchAllInput) {
    const query = contains(input.q);
    const rows = await this.prismaService.company.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { name: query },
          { industry: query },
          { location: query },
        ],
      },
      select: {
        id: true,
        name: true,
        industry: true,
        location: true,
      },
      orderBy: { updatedAt: "desc" },
      take: input.limit,
    });

    return rows.map((row) => ({
      title: row.name,
      subtitle: joinParts([row.industry, row.location]),
      targetId: row.id,
      targetPath: `/companies/${row.id}`,
    }));
  }

  private async searchContacts(input: SearchAllInput) {
    const query = contains(input.q);
    const rows = await this.prismaService.contact.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { name: query },
          { department: query },
          { position: query },
          { phone: query },
          { email: query },
          { company: { is: { name: query, deletedAt: null } } },
        ],
      },
      select: {
        id: true,
        name: true,
        department: true,
        position: true,
        email: true,
        company: { select: { name: true, deletedAt: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: input.limit,
    });

    return rows.map((row) => ({
      title: row.name,
      subtitle: joinParts([
        row.company?.deletedAt ? null : row.company?.name,
        joinParts([row.department, row.position], " "),
        row.email,
      ]),
      targetId: row.id,
      targetPath: `/contacts/${row.id}`,
    }));
  }

  private async searchProducts(input: SearchAllInput) {
    const query = contains(input.q);
    const rows = await this.prismaService.product.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { name: query },
          { category: query },
          { description: query },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      orderBy: { updatedAt: "desc" },
      take: input.limit,
    });

    return rows.map((row) => ({
      title: row.name,
      subtitle: joinParts([row.category, truncateText(row.description)]),
      targetId: row.id,
      targetPath: `/products/${row.id}`,
    }));
  }

  private async searchDeals(input: SearchAllInput) {
    const activeRows = await this.prismaService.deal.findMany({
      where: createDealWhere(input, [
        DealStage.INITIAL_CONTACT,
        DealStage.IN_DISCUSSION,
      ]),
      select: dealSearchSelect,
      orderBy: { updatedAt: "desc" },
      take: input.limit,
    });
    const remaining = input.limit - activeRows.length;
    const closedRows =
      remaining > 0
        ? await this.prismaService.deal.findMany({
            where: createDealWhere(input, [DealStage.WON, DealStage.LOST]),
            select: dealSearchSelect,
            orderBy: { updatedAt: "desc" },
            take: remaining,
          })
        : [];

    return [...activeRows, ...closedRows].map((row) => ({
      title: row.title,
      subtitle: joinParts([
        dealStageLabels[row.stage],
        row.company?.deletedAt ? null : row.company?.name,
        row.contact?.deletedAt ? null : row.contact?.name,
        `${row.amount.toString()} ${row.currency}`,
      ]),
      targetId: row.id,
      targetPath: `/deals/${row.id}`,
    }));
  }

  private async searchSchedules(input: SearchAllInput) {
    const query = contains(input.q);
    const rows = await this.prismaService.schedule.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { title: query },
          { location: query },
          { company: { is: { name: query, deletedAt: null } } },
          { contact: { is: { name: query, deletedAt: null } } },
          { deal: { is: { title: query, deletedAt: null } } },
        ],
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        location: true,
        company: { select: { name: true, deletedAt: true } },
        contact: { select: { name: true, deletedAt: true } },
        deal: { select: { title: true, deletedAt: true } },
      },
      orderBy: { startAt: "desc" },
      take: input.limit,
    });

    return rows.map((row) => ({
      title: row.title,
      subtitle: joinParts([
        formatDate(row.startAt),
        row.location,
        row.company?.deletedAt ? null : row.company?.name,
        row.contact?.deletedAt ? null : row.contact?.name,
        row.deal?.deletedAt ? null : row.deal?.title,
      ]),
      targetId: row.id,
      targetPath: "/schedules",
    }));
  }

  private async searchMeetingNotes(input: SearchAllInput) {
    const query = contains(input.q);
    const rows = await this.prismaService.meetingNote.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { companyName: query },
          { contactName: query },
          { productName: query },
          { stageText: query },
          { deal: { is: { title: query, deletedAt: null } } },
        ],
      },
      select: {
        id: true,
        meetingDate: true,
        companyName: true,
        contactName: true,
        productName: true,
        stageText: true,
        deal: { select: { title: true, deletedAt: true } },
      },
      orderBy: [{ meetingDate: "desc" }, { updatedAt: "desc" }],
      take: input.limit,
    });

    return rows.map((row) => ({
      title: createMeetingNoteTitle(row),
      subtitle: joinParts([
        formatDate(row.meetingDate),
        row.productName,
        row.stageText,
        row.deal?.deletedAt ? null : row.deal?.title,
      ]),
      targetId: row.id,
      targetPath: `/meeting-notes/${row.id}`,
    }));
  }
}

const dealStageLabels: Record<DealStage, string> = {
  INITIAL_CONTACT: "초기 접촉",
  IN_DISCUSSION: "논의 중",
  WON: "성사",
  LOST: "실패",
};

const dealSearchSelect = {
  id: true,
  title: true,
  amount: true,
  currency: true,
  stage: true,
  company: { select: { name: true, deletedAt: true } },
  contact: { select: { name: true, deletedAt: true } },
} satisfies Prisma.DealSelect;

function createDealWhere(
  input: SearchAllInput,
  stages: readonly DealStage[]
): Prisma.DealWhereInput {
  const query = contains(input.q);

  return {
    userId: input.userId,
    deletedAt: null,
    stage: { in: [...stages] },
    OR: [
      { title: query },
      { nextActionTitle: query },
      { company: { is: { name: query, deletedAt: null } } },
      { contact: { is: { name: query, deletedAt: null } } },
    ],
  };
}

function contains(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function joinParts(
  parts: ReadonlyArray<string | null | undefined>,
  separator = " · "
) {
  const joined = parts
    .map((part) => part?.trim() ?? "")
    .filter((part) => part.length > 0)
    .join(separator);

  return joined.length > 0 ? joined : null;
}

function truncateText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= 60) {
    return normalized;
  }

  return `${normalized.slice(0, 60)}...`;
}

function formatDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

function createMeetingNoteTitle(input: {
  readonly meetingDate?: Date | null;
  readonly companyName?: string | null;
  readonly contactName?: string | null;
}) {
  const owner = input.companyName ?? input.contactName ?? "회의록";
  const date = formatDate(input.meetingDate ?? null);

  return date ? `${owner} / ${date}` : owner;
}
