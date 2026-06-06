import type {
  DeleteResultRecord,
  ScheduleDetailRecord,
  ScheduleListResult,
  ScheduleRecord,
  ScheduleRelatedCompanyRecord,
  ScheduleRelatedContactRecord,
  ScheduleRelatedDealRecord,
  ScheduleReminderRecord,
} from "@/modules/schedule/application/ports/schedule.repository";

export interface ScheduleReminderResponse {
  readonly id: string;
  readonly channel: string;
  readonly remindAt: string;
  readonly sentAt: string | null;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ScheduleResponse {
  readonly id: string;
  readonly title: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly memo: string | null;
  readonly source: string;
  readonly dealId: string | null;
  readonly dealTitle: string | null;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactId: string | null;
  readonly contactName: string | null;
  readonly reminders: ScheduleReminderResponse[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ScheduleRelatedDealResponse {
  readonly id: string;
  readonly title: string;
}

export interface ScheduleRelatedCompanyResponse {
  readonly id: string;
  readonly name: string;
}

export interface ScheduleRelatedContactResponse {
  readonly id: string;
  readonly name: string;
}

export interface ScheduleDetailResponse {
  readonly schedule: ScheduleResponse;
  readonly deal: ScheduleRelatedDealResponse | null;
  readonly company: ScheduleRelatedCompanyResponse | null;
  readonly contact: ScheduleRelatedContactResponse | null;
  readonly reminders: ScheduleReminderResponse[];
}

export interface ScheduleListResponse {
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly items: ScheduleResponse[];
}

export interface WeeklyScheduleDayResponse {
  readonly date: string;
  readonly schedules: ScheduleResponse[];
}

export interface WeeklyScheduleResponse {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly days: WeeklyScheduleDayResponse[];
}

export interface DeleteScheduleResponse {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export function toScheduleResponse(schedule: ScheduleRecord): ScheduleResponse {
  return {
    id: schedule.id,
    title: schedule.title,
    startAt: schedule.startAt.toISOString(),
    endAt: schedule.endAt.toISOString(),
    allDay: schedule.allDay,
    location: schedule.location,
    memo: schedule.memo,
    source: schedule.source,
    dealId: schedule.dealId,
    dealTitle: schedule.dealTitle,
    companyId: schedule.companyId,
    companyName: schedule.companyName,
    contactId: schedule.contactId,
    contactName: schedule.contactName,
    reminders: schedule.reminders.map(toScheduleReminderResponse),
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(schedule.deletedAt),
    permanentDeleteAt: toIsoOrNull(schedule.permanentDeleteAt),
  };
}

export function toScheduleDetailResponse(
  detail: ScheduleDetailRecord
): ScheduleDetailResponse {
  return {
    schedule: toScheduleResponse(detail.schedule),
    deal: toRelatedDealResponse(detail.deal),
    company: toRelatedCompanyResponse(detail.company),
    contact: toRelatedContactResponse(detail.contact),
    reminders: detail.reminders.map(toScheduleReminderResponse),
  };
}

export function toScheduleListResponse(
  result: ScheduleListResult
): ScheduleListResponse {
  return {
    rangeStart: result.rangeStart.toISOString(),
    rangeEnd: result.rangeEnd.toISOString(),
    items: result.items.map(toScheduleResponse),
  };
}

export function toWeeklyScheduleResponse(input: {
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly days: Array<{
    readonly date: string;
    readonly schedules: ScheduleRecord[];
  }>;
}): WeeklyScheduleResponse {
  return {
    weekStart: input.weekStart.toISOString(),
    weekEnd: input.weekEnd.toISOString(),
    days: input.days.map((day) => ({
      date: day.date,
      schedules: day.schedules.map(toScheduleResponse),
    })),
  };
}

export function toDeleteScheduleResponse(
  result: DeleteResultRecord
): DeleteScheduleResponse {
  return {
    id: result.id,
    deletedAt: result.deletedAt.toISOString(),
    permanentDeleteAt: result.permanentDeleteAt.toISOString(),
  };
}

function toScheduleReminderResponse(
  reminder: ScheduleReminderRecord
): ScheduleReminderResponse {
  return {
    id: reminder.id,
    channel: reminder.channel,
    remindAt: reminder.remindAt.toISOString(),
    sentAt: toIsoOrNull(reminder.sentAt),
    status: reminder.status,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
  };
}

function toRelatedDealResponse(
  deal: ScheduleRelatedDealRecord | null
): ScheduleRelatedDealResponse | null {
  return deal ? { id: deal.id, title: deal.title } : null;
}

function toRelatedCompanyResponse(
  company: ScheduleRelatedCompanyRecord | null
): ScheduleRelatedCompanyResponse | null {
  return company ? { id: company.id, name: company.name } : null;
}

function toRelatedContactResponse(
  contact: ScheduleRelatedContactRecord | null
): ScheduleRelatedContactResponse | null {
  return contact ? { id: contact.id, name: contact.name } : null;
}

function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
