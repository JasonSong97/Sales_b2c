import type {
  CreateScheduleInput,
  DeleteResultRecord,
  ListSchedulesInput,
  ScheduleDetailRecord,
  ScheduleListResult,
  ScheduleRecord,
  ScheduleRepository,
  UpdateScheduleInput,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { InvalidScheduleRangeError } from "../../domain/schedule.errors";
import { CreateScheduleUseCase } from "./create-schedule.use-case";
import { GetScheduleUseCase } from "./get-schedule.use-case";
import { GetWeeklySchedulesUseCase } from "./get-weekly-schedules.use-case";
import { ListSchedulesUseCase } from "./list-schedules.use-case";

class FakeScheduleRepository implements ScheduleRepository {
  createInput: CreateScheduleInput | null = null;
  listInput: ListSchedulesInput | null = null;
  updateInput: UpdateScheduleInput | null = null;
  listItems: ScheduleRecord[] = [];
  detail: ScheduleDetailRecord | null = null;

  async listSchedules(input: ListSchedulesInput): Promise<ScheduleListResult> {
    this.listInput = input;

    return {
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      items: this.listItems,
    };
  }

  async createSchedule(input: CreateScheduleInput): Promise<ScheduleRecord> {
    this.createInput = input;

    return createScheduleRecord({
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      dealId: input.dealId,
      companyId: input.companyId,
      contactId: input.contactId,
      reminderCount: input.reminderMinutes.length,
    });
  }

  async getScheduleDetail(): Promise<ScheduleDetailRecord | null> {
    return this.detail;
  }

  async updateSchedule(input: UpdateScheduleInput): Promise<ScheduleRecord> {
    this.updateInput = input;

    return createScheduleRecord({
      title: input.title ?? "일정",
      startAt: input.startAt ?? new Date("2026-06-07T01:00:00.000Z"),
      endAt: input.endAt ?? new Date("2026-06-07T02:00:00.000Z"),
      dealId: input.dealId ?? null,
      companyId: input.companyId ?? null,
      contactId: input.contactId ?? null,
      reminderCount: input.reminderMinutes?.length ?? 0,
    });
  }

  async deleteSchedule(
    userId: string,
    scheduleId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    return {
      id: `${userId}:${scheduleId}`,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreSchedule(userId: string, scheduleId: string): Promise<ScheduleRecord> {
    return createScheduleRecord({ id: scheduleId, userId });
  }
}

describe("Schedule use cases", () => {
  it("normalizes create input and preserves current user ownership", async () => {
    const repository = new FakeScheduleRepository();
    const useCase = new CreateScheduleUseCase(repository);

    await useCase.execute(currentUser(), {
      title: "  제안 미팅  ",
      startAt: "2026-06-07T01:00:00.000Z",
      endAt: "2026-06-07T02:00:00.000Z",
      location: "  강남  ",
      dealId: "  deal-1  ",
      companyId: "  company-1  ",
      contactId: "  contact-1  ",
      memo: "  견적 논의  ",
      reminderMinutes: [30, 10, 30],
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      title: "제안 미팅",
      location: "강남",
      dealId: "deal-1",
      companyId: "company-1",
      contactId: "contact-1",
      memo: "견적 논의",
      reminderMinutes: [10, 30],
    });
  });

  it("rejects invalid schedule ranges before repository writes", async () => {
    const repository = new FakeScheduleRepository();
    const useCase = new CreateScheduleUseCase(repository);

    await expect(
      useCase.execute(currentUser(), {
        title: "역전된 일정",
        startAt: "2026-06-07T03:00:00.000Z",
        endAt: "2026-06-07T02:00:00.000Z",
      })
    ).rejects.toBeInstanceOf(InvalidScheduleRangeError);
    expect(repository.createInput).toBeNull();
  });

  it("passes explicit list range and related filters to repository", async () => {
    const repository = new FakeScheduleRepository();
    const useCase = new ListSchedulesUseCase(repository);

    await useCase.execute(currentUser(), {
      from: "2026-06-01T00:00:00.000Z",
      to: "2026-07-01T00:00:00.000Z",
      dealId: " deal-1 ",
      source: "INTERNAL",
    });

    expect(repository.listInput).toMatchObject({
      userId: "user-1",
      dealId: "deal-1",
      source: "INTERNAL",
    });
    expect(repository.listInput?.rangeStart.toISOString()).toBe(
      "2026-06-01T00:00:00.000Z"
    );
    expect(repository.listInput?.rangeEnd.toISOString()).toBe(
      "2026-07-01T00:00:00.000Z"
    );
  });

  it("groups weekly schedules by local timezone date", async () => {
    const repository = new FakeScheduleRepository();
    repository.listItems = [
      createScheduleRecord({
        id: "schedule-1",
        title: "월요일 미팅",
        startAt: new Date("2026-06-01T01:00:00+09:00"),
      }),
      createScheduleRecord({
        id: "schedule-2",
        title: "수요일 미팅",
        startAt: new Date("2026-06-03T11:00:00+09:00"),
      }),
    ];
    const useCase = new GetWeeklySchedulesUseCase(repository);

    const response = await useCase.execute(currentUser(), {
      weekStart: "2026-06-01",
      timezone: "Asia/Seoul",
    });

    expect(response.days).toHaveLength(7);
    expect(response.days[0]?.date).toBe("2026-06-01");
    expect(response.days[0]?.schedules[0]?.title).toBe("월요일 미팅");
    expect(response.days[2]?.date).toBe("2026-06-03");
    expect(response.days[2]?.schedules[0]?.title).toBe("수요일 미팅");
  });

  it("blocks detail reads for deleted schedules", async () => {
    const repository = new FakeScheduleRepository();
    const schedule = createScheduleRecord({
      deletedAt: new Date("2026-06-07T01:00:00.000Z"),
    });
    repository.detail = {
      schedule,
      deal: null,
      company: null,
      contact: null,
      reminders: [],
    };
    const useCase = new GetScheduleUseCase(repository);

    await expect(useCase.execute(currentUser(), "schedule-1")).rejects.toBeInstanceOf(
      DeletedResourceError
    );
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

function createScheduleRecord(
  overrides: Partial<ScheduleRecord> & {
    readonly reminderCount?: number;
  } = {}
): ScheduleRecord {
  const startAt = overrides.startAt ?? new Date("2026-06-07T01:00:00.000Z");
  const endAt = overrides.endAt ?? new Date(startAt.getTime() + 60 * 60 * 1000);

  return {
    id: overrides.id ?? "schedule-1",
    userId: overrides.userId ?? "user-1",
    title: overrides.title ?? "일정",
    startAt,
    endAt,
    allDay: overrides.allDay ?? false,
    location: overrides.location ?? null,
    memo: overrides.memo ?? null,
    source: overrides.source ?? "INTERNAL",
    dealId: overrides.dealId ?? null,
    dealTitle: overrides.dealTitle ?? null,
    companyId: overrides.companyId ?? null,
    companyName: overrides.companyName ?? null,
    contactId: overrides.contactId ?? null,
    contactName: overrides.contactName ?? null,
    reminders: Array.from({ length: overrides.reminderCount ?? 0 }, (_, index) => ({
      id: `reminder-${index + 1}`,
      channel: "EMAIL",
      remindAt: new Date(startAt.getTime() - (index + 1) * 10 * 60 * 1000),
      sentAt: null,
      status: "PENDING",
      createdAt: startAt,
      updatedAt: startAt,
    })),
    createdAt: overrides.createdAt ?? startAt,
    updatedAt: overrides.updatedAt ?? startAt,
    deletedAt: overrides.deletedAt ?? null,
    permanentDeleteAt: overrides.permanentDeleteAt ?? null,
  };
}
