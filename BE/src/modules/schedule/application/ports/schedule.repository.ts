import type { DeleteResultRecord } from "@/modules/company/application/ports/company.repository";

export type { DeleteResultRecord } from "@/modules/company/application/ports/company.repository";

export const SCHEDULE_REPOSITORY = Symbol("SCHEDULE_REPOSITORY");

export type ScheduleSource = "INTERNAL" | "GOOGLE";

export type ScheduleReminderChannel = "EMAIL" | "BROWSER_PUSH";

export type ScheduleReminderStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "READ"
  | "CANCELED";

export interface ScheduleReminderRecord {
  readonly id: string;
  readonly channel: ScheduleReminderChannel;
  readonly remindAt: Date;
  readonly sentAt: Date | null;
  readonly status: ScheduleReminderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ScheduleRelatedDealRecord {
  readonly id: string;
  readonly title: string;
}

export interface ScheduleRelatedCompanyRecord {
  readonly id: string;
  readonly name: string;
}

export interface ScheduleRelatedContactRecord {
  readonly id: string;
  readonly name: string;
}

export interface ScheduleRecord {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly memo: string | null;
  readonly source: ScheduleSource;
  readonly dealId: string | null;
  readonly dealTitle: string | null;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactId: string | null;
  readonly contactName: string | null;
  readonly reminders: ScheduleReminderRecord[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ScheduleDetailRecord {
  readonly schedule: ScheduleRecord;
  readonly deal: ScheduleRelatedDealRecord | null;
  readonly company: ScheduleRelatedCompanyRecord | null;
  readonly contact: ScheduleRelatedContactRecord | null;
  readonly reminders: ScheduleReminderRecord[];
}

export interface ScheduleListResult {
  readonly rangeStart: Date;
  readonly rangeEnd: Date;
  readonly items: ScheduleRecord[];
}

export interface ListSchedulesInput {
  readonly userId: string;
  readonly rangeStart: Date;
  readonly rangeEnd: Date;
  readonly dealId: string | null;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly source: ScheduleSource | null;
}

export interface CreateScheduleInput {
  readonly userId: string;
  readonly title: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly memo: string | null;
  readonly dealId: string | null;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly reminderMinutes: number[];
}

export interface UpdateScheduleInput {
  readonly userId: string;
  readonly scheduleId: string;
  readonly title?: string;
  readonly startAt?: Date;
  readonly endAt?: Date;
  readonly allDay?: boolean;
  readonly location?: string | null;
  readonly memo?: string | null;
  readonly dealId?: string | null;
  readonly companyId?: string | null;
  readonly contactId?: string | null;
  readonly reminderMinutes?: number[];
}

export interface ScheduleRepository {
  listSchedules(input: ListSchedulesInput): Promise<ScheduleListResult>;
  createSchedule(input: CreateScheduleInput): Promise<ScheduleRecord>;
  getScheduleDetail(
    userId: string,
    scheduleId: string
  ): Promise<ScheduleDetailRecord | null>;
  updateSchedule(input: UpdateScheduleInput): Promise<ScheduleRecord>;
  deleteSchedule(
    userId: string,
    scheduleId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  restoreSchedule(userId: string, scheduleId: string): Promise<ScheduleRecord>;
}
