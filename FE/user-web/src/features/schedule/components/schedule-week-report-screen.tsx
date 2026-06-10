import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWeeklySchedules } from "@/features/schedule/hooks/use-schedule-queries";
import type { Schedule } from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateWithOptions } from "@/utils/format";

const timezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";

export function ScheduleWeekReportScreen() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const weeklyQuery = useWeeklySchedules({
    weekStart: toDateKey(weekStart),
    timezone,
  });
  const weekEnd = addDays(weekStart, 6);

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary"
            to="/schedules"
          >
            일정
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">주간 보고서</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            선택한 주의 영업 일정을 날짜별로 확인합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="이전 주"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[190px] text-center text-base font-semibold">
            {formatDateShort(weekStart)} - {formatDateShort(weekEnd)}
          </div>
          <button
            aria-label="다음 주"
            className="grid h-9 w-9 place-items-center rounded-md border bg-white hover:bg-muted"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            이번 주
          </button>
        </div>
      </header>

      {weeklyQuery.isLoading ? (
        <WeekReportSkeleton />
      ) : weeklyQuery.isError ? (
        <WeekReportError
          error={weeklyQuery.error}
          onRetry={() => void weeklyQuery.refetch()}
        />
      ) : (
        <div className="grid gap-3">
          {weeklyQuery.data?.days.map((day) => (
            <article className="rounded-lg border bg-white p-4" key={day.date}>
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {formatDateWithWeekday(new Date(`${day.date}T00:00:00`))}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {day.schedules.length}개 일정
                  </p>
                </div>
              </div>
              {day.schedules.length === 0 ? (
                <p className="py-5 text-sm text-muted-foreground">
                  등록된 일정이 없습니다.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {day.schedules.map((schedule) => (
                    <WeekReportScheduleRow
                      key={schedule.id}
                      schedule={schedule}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function WeekReportScheduleRow({ schedule }: { readonly schedule: Schedule }) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 px-3 py-3 md:grid-cols-[130px_minmax(0,1fr)_180px] md:items-center">
      <span className="text-sm font-medium">{formatTimeRange(schedule)}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{schedule.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {[schedule.dealTitle, schedule.companyName, schedule.contactName]
            .filter(Boolean)
            .join(" · ") || "연결 대상 없음"}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        {schedule.source === "GOOGLE" ? "Google" : "내부 일정"}
      </div>
    </div>
  );
}

function WeekReportError({
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

function WeekReportSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="h-28 animate-pulse rounded-lg border bg-muted"
          key={index}
        />
      ))}
    </div>
  );
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

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function formatDateShort(date: Date) {
  return formatDate(date);
}

function formatDateWithWeekday(date: Date) {
  return formatDateWithOptions(date, {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTimeRange(schedule: Schedule) {
  if (schedule.allDay) {
    return "종일";
  }

  return `${formatDateWithOptions(schedule.startAt, {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${formatDateWithOptions(schedule.endAt, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
