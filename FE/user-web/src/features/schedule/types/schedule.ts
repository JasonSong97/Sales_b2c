export type ScheduleSource = "INTERNAL" | "GOOGLE";

export type ScheduleReminderStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "READ"
  | "CANCELED";

export type ScheduleReminder = {
  readonly id: string;
  readonly channel: string;
  readonly remindAt: string;
  readonly sentAt: string | null;
  readonly status: ScheduleReminderStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type Schedule = {
  readonly id: string;
  readonly title: string;
  readonly startAt: string;
  readonly endAt: string;
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
  readonly reminders: ScheduleReminder[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type ScheduleDetail = {
  readonly schedule: Schedule;
  readonly deal: { readonly id: string; readonly title: string } | null;
  readonly company: { readonly id: string; readonly name: string } | null;
  readonly contact: { readonly id: string; readonly name: string } | null;
  readonly reminders: ScheduleReminder[];
};

export type ScheduleListResponse = {
  readonly rangeStart: string;
  readonly rangeEnd: string;
  readonly items: Schedule[];
};

export type WeeklyScheduleDay = {
  readonly date: string;
  readonly schedules: Schedule[];
};

export type WeeklyScheduleResponse = {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly days: WeeklyScheduleDay[];
};

export type ScheduleListParams = {
  readonly from?: string;
  readonly to?: string;
  readonly timezone?: string;
  readonly dealId?: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly source?: ScheduleSource;
};

export type CreateScheduleInput = {
  readonly title: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly allDay?: boolean;
  readonly location?: string;
  readonly dealId?: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly memo?: string;
  readonly reminderMinutes?: number[];
};

export type UpdateScheduleInput = Partial<CreateScheduleInput> & {
  readonly scheduleId: string;
};

export type DeleteScheduleResponse = {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
};

export type WeeklyScheduleParams = {
  readonly weekStart: string;
  readonly timezone?: string;
};
