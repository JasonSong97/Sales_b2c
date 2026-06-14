import {
  BadgeCheck,
  Laptop,
  Link2,
  Save,
  ShieldCheck,
  Smartphone,
  Timer,
  UserRound,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Toast } from "@/components/ui/toast";
import {
  useMyDevices,
  useMyProfile,
  useUpdateMyProfileMutation,
} from "@/features/auth/hooks/use-user-settings";
import type {
  MyDevice,
  UserProfileOAuthAccount,
  UserProfileResponse,
} from "@/features/auth/types/auth";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

const DEFAULT_TIME_ZONE = "Asia/Seoul";

const TIME_ZONE_OPTIONS = [
  { label: "서울 (Asia/Seoul)", value: "Asia/Seoul" },
  { label: "싱가폴 (Asia/Singapore)", value: "Asia/Singapore" },
  {
    label: "로스앤젤레스 (America/Los_Angeles)",
    value: "America/Los_Angeles",
  },
  { label: "뉴욕 (America/New_York)", value: "America/New_York" },
  { label: "런던 (Europe/London)", value: "Europe/London" },
] as const;

export function SettingsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const profileQuery = useMyProfile();
  const devicesQuery = useMyDevices();

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 py-6">
      <PageHeader
        description="내 개인 정보와 등록 기기를 확인합니다."
        title="설정"
      />

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ProfileSection
          error={profileQuery.error}
          isLoading={profileQuery.isLoading}
          onRetry={() => void profileQuery.refetch()}
          onSaved={() => setNotice("개인 정보가 저장되었습니다.")}
          profile={profileQuery.data ?? null}
        />
        <DeviceSection
          devices={devicesQuery.data?.devices ?? []}
          error={devicesQuery.error}
          isLoading={devicesQuery.isLoading}
          onRetry={() => void devicesQuery.refetch()}
        />
      </div>
    </section>
  );
}

function ProfileSection({
  profile,
  isLoading,
  error,
  onRetry,
  onSaved,
}: {
  readonly profile: UserProfileResponse | null;
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [formError, setFormError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateMyProfileMutation();
  const visibleTimeZoneOptions = getVisibleTimeZoneOptions(timeZone);

  useEffect(() => {
    setName(profile?.name ?? "");
    setTimeZone(profile?.timeZone ?? getBrowserTimeZoneFallback());
  }, [profile?.name, profile?.timeZone]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();

    if (nextName.length > 80) {
      setFormError("이름은 80자 이하로 입력해 주세요.");
      return;
    }

    setFormError(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: nextName.length > 0 ? nextName : null,
        timeZone,
      });
      onSaved();
    } catch (nextError) {
      setFormError(getApiErrorMessage(nextError));
    }
  };

  return (
    <section className="grid content-start gap-4">
      <SectionHeader
        description="이메일, 권한, 계정 상태는 읽기 전용입니다."
        title="개인 정보"
      />
      <div className="rounded-lg border bg-white p-5">
        {isLoading ? (
          <SettingsSkeleton rows={5} />
        ) : error ? (
          <InlineError error={error} onRetry={onRetry} />
        ) : profile ? (
          <div className="grid gap-5">
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    이름
                  </span>
                  <input
                    className="h-10 min-w-0 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="이름 없음"
                    value={name}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    시간대
                  </span>
                  <select
                    className="h-10 min-w-0 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    onChange={(event) => setTimeZone(event.target.value)}
                    value={timeZone}
                  >
                    {visibleTimeZoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={updateProfileMutation.isPending}
                  isPending={updateProfileMutation.isPending}
                  type="submit"
                  variant="primary"
                >
                  <Save className="h-4 w-4" />
                  저장
                </Button>
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
            </form>

            <dl className="grid gap-3 md:grid-cols-2">
              <ReadOnlyField icon={UserRound} label="이메일" value={profile.email} />
              <ReadOnlyField
                icon={ShieldCheck}
                label="권한"
                value={toRoleLabel(profile.role)}
              />
              <ReadOnlyField
                icon={BadgeCheck}
                label="계정 상태"
                value={toStatusLabel(profile.status)}
              />
              <ReadOnlyField
                icon={Timer}
                label="기본 시간대"
                value={toTimeZoneLabel(profile.timeZone)}
              />
              <ReadOnlyField
                icon={Laptop}
                label="마지막 로그인"
                value={formatDateTime(profile.lastLoginAt, { includeYear: true })}
              />
              <ReadOnlyField
                icon={UserRound}
                label="가입일"
                value={formatDateTime(profile.createdAt, { includeYear: true })}
              />
              <ReadOnlyField
                icon={UserRound}
                label="최근 수정일"
                value={formatDateTime(profile.updatedAt, { includeYear: true })}
              />
            </dl>

            <OAuthAccountList accounts={profile.oauthAccounts} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DeviceSection({
  devices,
  isLoading,
  error,
  onRetry,
}: {
  readonly devices: MyDevice[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="grid content-start gap-4">
      <SectionHeader
        description="로그인에 등록된 활성 기기만 표시합니다."
        title="등록 기기"
      />
      <div className="rounded-lg border bg-white p-4">
        {isLoading ? (
          <SettingsSkeleton rows={4} />
        ) : error ? (
          <InlineError error={error} onRetry={onRetry} />
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 활성 기기가 없습니다.
          </p>
        ) : (
          <div className="grid gap-3">
            {devices.map((device) => (
              <DeviceItem device={device} key={device.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DeviceItem({ device }: { readonly device: MyDevice }) {
  const Icon = device.slot === "mobile" ? Smartphone : Laptop;

  return (
    <article className="grid gap-3 rounded-md border px-3 py-3">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              {device.label || toDeviceSlotLabel(device.slot)}
            </h3>
            {device.isCurrentDevice ? (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                현재 기기
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {toDeviceSlotLabel(device.slot)} · 활성 세션{" "}
            {device.activeSessionCount.toLocaleString()}개
          </p>
        </div>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>마지막 사용</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.lastSeenAt, { includeYear: true })}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>등록일</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.createdAt, { includeYear: true })}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function OAuthAccountList({
  accounts,
}: {
  readonly accounts: UserProfileOAuthAccount[];
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">연결 provider</h3>
      </div>
      {accounts.length === 0 ? (
        <p className="rounded-md border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
          연결된 provider가 없습니다.
        </p>
      ) : (
        <div className="grid gap-2">
          {accounts.map((account) => (
            <article
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              key={account.id}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {toProviderLabel(account.provider)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {account.providerEmail ?? "이메일 없음"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateTime(account.createdAt, { includeYear: true })}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof UserRound;
  readonly label: string;
  readonly value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold">{value || "-"}</dd>
    </div>
  );
}

function InlineError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
    </div>
  );
}

function SettingsSkeleton({ rows }: { readonly rows: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}

function toProviderLabel(provider: string) {
  const labels: Record<string, string> = {
    apple: "Apple",
    google: "Google",
    kakao: "Kakao",
    naver: "Naver",
  };

  return labels[provider] ?? provider;
}

function toDeviceSlotLabel(slot: string) {
  const labels: Record<string, string> = {
    mobile: "모바일",
    personal_laptop: "개인 노트북",
    work_laptop: "회사 노트북",
  };

  return labels[slot] ?? slot;
}

function toRoleLabel(role: string) {
  return role === "ADMIN" ? "관리자" : "사용자";
}

function toStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "활성",
    DELETED: "삭제됨",
    SUSPENDED: "정지",
  };

  return labels[status] ?? status;
}

function toTimeZoneLabel(timeZone: string) {
  return (
    TIME_ZONE_OPTIONS.find((option) => option.value === timeZone)?.label ??
    timeZone
  );
}

function getBrowserTimeZoneFallback() {
  const browserTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;

  return TIME_ZONE_OPTIONS.some((option) => option.value === browserTimeZone)
    ? browserTimeZone
    : DEFAULT_TIME_ZONE;
}

function getVisibleTimeZoneOptions(timeZone: string) {
  return TIME_ZONE_OPTIONS.some((option) => option.value === timeZone)
    ? TIME_ZONE_OPTIONS
    : [...TIME_ZONE_OPTIONS, { label: timeZone, value: timeZone }];
}
