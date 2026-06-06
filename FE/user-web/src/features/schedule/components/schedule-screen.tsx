import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScheduleFormDialog } from "@/features/schedule/components/schedule-form-dialog";
import { useScheduleList } from "@/features/schedule/hooks/use-schedule-queries";
import type { Schedule } from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";

type ViewMode = "month" | "week";

const timezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
const weekDayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export function ScheduleScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [initialStartAt, setInitialStartAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const range = useMemo(
    () =>
      viewMode === "month"
        ? getMonthRange(anchorDate)
        : getWeekRange(anchorDate),
    [anchorDate, viewMode]
  );
  const schedulesQuery = useScheduleList({
    from: range.start.toISOString(),
    to: range.end.toISOString(),
    timezone,
  });
  const schedules = useMemo(
    () => schedulesQuery.data?.items ?? [],
    [schedulesQuery.data?.items]
  );
  const schedulesByDate = useMemo(
    () => groupSchedulesByDate(schedules),
    [schedules]
  );
  const title =
    viewMode === "month"
      ? formatMonthTitle(anchorDate)
      : `${formatDateShort(range.start)} - ${formatDateShort(
          addDays(range.end, -1)
        )}`;

  const openCreateDialog = (startAt: Date | null = null) => {
    setSelectedSchedule(null);
    setInitialStartAt(startAt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setInitialStartAt(null);
    setIsDialogOpen(true);
  };

  const movePrevious = () => {
    setAnchorDate((current) =>
      viewMode === "month" ? addMonths(current, -1) : addDays(current, -7)
    );
  };

  const moveNext = () => {
    setAnchorDate((current) =>
      viewMode === "month" ? addMonths(current, 1) : addDays(current, 7)
    );
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">일정</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            월간 일정 맥락과 이번 주 영업 일정을 함께 확인합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
            to="/schedules/week"
          >
            <FileText className="h-4 w-4" />
            주간 보고서
          </Link>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            onClick={() => openCreateDialog()}
            type="button"
          >
            <Plus className="h-4 w-4" />
            일정 생성
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit rounded-md border bg-white p-1">
          <button
            className={`h-8 rounded px-3 text-sm font-medium ${
              viewMode === "month"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => setViewMode("month")}
            type="button"
          >
            월간
          </button>
          <button
            className={`h-8 rounded px-3 text-sm font-medium ${
              viewMode === "week"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => setViewMode("week")}
            type="button"
          >
            주간
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="이전 기간"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={movePrevious}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[190px] text-center text-lg font-semibold">
            {title}
          </div>
          <button
            aria-label="다음 기간"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={moveNext}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
            onClick={() => setAnchorDate(new Date())}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            오늘
          </button>
        </div>
      </div>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {schedulesQuery.isLoading ? (
        <CalendarSkeleton />
      ) : schedulesQuery.isError ? (
        <ScheduleError
          error={schedulesQuery.error}
          onRetry={() => void schedulesQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4">
          <div className="overflow-x-auto rounded-lg border bg-white">
            {viewMode === "month" ? (
              <MonthCalendar
                anchorDate={anchorDate}
                onCreate={openCreateDialog}
                onEdit={openEditDialog}
                schedulesByDate={schedulesByDate}
              />
            ) : (
              <WeekCalendar
                rangeStart={range.start}
                onCreate={openCreateDialog}
                onEdit={openEditDialog}
                schedulesByDate={schedulesByDate}
              />
            )}
          </div>

          {schedules.length === 0 ? (
            <ScheduleEmptyState
              mode={viewMode}
              onCreate={() => openCreateDialog(range.start)}
            />
          ) : null}
        </div>
      )}

      <ScheduleFormDialog
        initialStartAt={initialStartAt}
        onOpenChange={setIsDialogOpen}
        onSaved={setNotice}
        open={isDialogOpen}
        schedule={selectedSchedule}
      />
    </section>
  );
}

type CalendarProps = {
  readonly schedulesByDate: Map<string, Schedule[]>;
  readonly onCreate: (startAt: Date) => void;
  readonly onEdit: (schedule: Schedule) => void;
};

function MonthCalendar({
  anchorDate,
  schedulesByDate,
  onCreate,
  onEdit,
}: CalendarProps & { readonly anchorDate: Date }) {
  const cells = getMonthCells(anchorDate);
  const currentMonth = anchorDate.getMonth();

  return (
    <div className="min-w-[820px]">
      <CalendarHeader />
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const dateKey = toDateKey(cell);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];
          const isOutsideMonth = cell.getMonth() !== currentMonth;

          return (
            <section
              className={`min-h-[142px] border-r border-t p-2 last:border-r-0 ${
                isOutsideMonth ? "bg-muted/40 text-muted-foreground" : "bg-white"
              }`}
              key={dateKey}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  className={`grid h-7 w-7 place-items-center rounded-md text-sm font-medium ${
                    isToday(cell)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onCreate(setHour(cell, 9))}
                  type="button"
                >
                  {cell.getDate()}
                </button>
                <button
                  aria-label={`${formatDateShort(cell)} 일정 생성`}
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  onClick={() => onCreate(setHour(cell, 9))}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-1">
                {daySchedules.slice(0, 4).map((schedule) => (
                  <SchedulePill
                    key={schedule.id}
                    onClick={() => onEdit(schedule)}
                    schedule={schedule}
                  />
                ))}
                {daySchedules.length > 4 ? (
                  <span className="truncate text-xs text-muted-foreground">
                    +{daySchedules.length - 4}개
                  </span>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function WeekCalendar({
  rangeStart,
  schedulesByDate,
  onCreate,
  onEdit,
}: CalendarProps & { readonly rangeStart: Date }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(rangeStart, index));

  return (
    <div className="min-w-[820px]">
      <CalendarHeader />
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];

          return (
            <section className="min-h-[460px] border-r border-t p-3 last:border-r-0" key={dateKey}>
              <button
                className={`mb-3 inline-flex h-8 items-center rounded-md px-2 text-sm font-semibold ${
                  isToday(day)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => onCreate(setHour(day, 9))}
                type="button"
              >
                {formatMonthDay(day)}
              </button>
              <div className="grid gap-2">
                {daySchedules.length === 0 ? (
                  <button
                    className="h-16 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted"
                    onClick={() => onCreate(setHour(day, 9))}
                    type="button"
                  >
                    일정 생성
                  </button>
                ) : (
                  daySchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      onClick={() => onEdit(schedule)}
                      schedule={schedule}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 border-b bg-muted">
      {weekDayLabels.map((label) => (
        <div className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground" key={label}>
          {label}
        </div>
      ))}
    </div>
  );
}

function SchedulePill({
  schedule,
  onClick,
}: {
  readonly schedule: Schedule;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="grid min-h-8 rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-left hover:border-sky-200 hover:bg-sky-100"
      onClick={onClick}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-slate-900">
        {schedule.source === "GOOGLE" ? (
          <span className="shrink-0 rounded bg-emerald-100 px-1 text-[10px] text-emerald-700">
            G
          </span>
        ) : null}
        <span className="truncate">
          {formatScheduleTime(schedule)} {schedule.title}
        </span>
      </span>
      <span className="truncate text-[11px] text-slate-600">
        {formatScheduleContext(schedule)}
      </span>
    </button>
  );
}

function ScheduleCard({
  schedule,
  onClick,
}: {
  readonly schedule: Schedule;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="grid gap-2 rounded-lg border bg-white p-3 text-left hover:bg-muted/50"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{schedule.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatScheduleTimeRange(schedule)}
          </p>
        </div>
        {schedule.source === "GOOGLE" ? <SourceBadge /> : null}
      </div>
      <p className="truncate text-xs text-slate-700">
        {formatScheduleContext(schedule)}
      </p>
      {schedule.location ? (
        <p className="truncate text-xs text-muted-foreground">{schedule.location}</p>
      ) : null}
    </button>
  );
}

function SourceBadge() {
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-emerald-50 px-2 text-xs font-medium text-emerald-700">
      Google
    </span>
  );
}

function ScheduleEmptyState({
  mode,
  onCreate,
}: {
  readonly mode: ViewMode;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border bg-white px-5 py-10 text-center">
      <div>
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-base font-semibold">
          {mode === "month" ? "이번 달 일정이 없습니다." : "이번 주 일정이 없습니다."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          새 일정을 만들면 캘린더에서 바로 확인할 수 있습니다.
        </p>
        <button
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={onCreate}
          type="button"
        >
          <Plus className="h-4 w-4" />
          일정 생성
        </button>
      </div>
    </div>
  );
}

function ScheduleError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(error)}
          </p>
          <button
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
            onClick={onRetry}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div className="h-28 animate-pulse rounded-md bg-muted" key={index} />
        ))}
      </div>
    </div>
  );
}

function groupSchedulesByDate(schedules: Schedule[]) {
  const grouped = new Map<string, Schedule[]>();

  for (const schedule of schedules) {
    const key = toDateKey(new Date(schedule.startAt));
    const items = grouped.get(key) ?? [];
    items.push(schedule);
    grouped.set(key, items);
  }

  return grouped;
}

function getMonthCells(anchorDate: Date) {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  const gridStart = getWeekStart(monthStart);
  const gridEnd = addDays(getWeekStart(monthEnd), 7);
  const cells: Date[] = [];

  for (
    let current = new Date(gridStart);
    current < gridEnd;
    current = addDays(current, 1)
  ) {
    cells.push(current);
  }

  return cells;
}

function getMonthRange(anchorDate: Date) {
  return {
    start: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1),
    end: new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1),
  };
}

function getWeekRange(anchorDate: Date) {
  const start = getWeekStart(anchorDate);

  return { start, end: addDays(start, 7) };
}

function getWeekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function setHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);

  return next;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function isToday(date: Date) {
  return toDateKey(date) === toDateKey(new Date());
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatMonthDay(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
}

function formatScheduleTime(schedule: Schedule) {
  if (schedule.allDay) {
    return "종일";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(schedule.startAt));
}

function formatScheduleTimeRange(schedule: Schedule) {
  if (schedule.allDay) {
    return "종일";
  }

  return `${formatScheduleTime(schedule)} - ${new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(schedule.endAt))}`;
}

function formatScheduleContext(schedule: Schedule) {
  return (
    [schedule.dealTitle, schedule.companyName, schedule.contactName]
      .filter(Boolean)
      .join(" · ") || "연결 대상 없음"
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
