import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useCreateMeetingNoteMutation,
  useGenerateMeetingNoteMutation,
  useLinkMeetingNoteToDealMutation,
  useUpdateMeetingNoteMutation,
} from "@/features/meeting-note/hooks/use-meeting-note-mutations";
import { useMeetingNoteDealOptions } from "@/features/meeting-note/hooks/use-meeting-note-deal-options";
import { useMeetingNoteDetail } from "@/features/meeting-note/hooks/use-meeting-note-queries";
import {
  emptyMeetingNoteFormValues,
  meetingNoteFormSchema,
  toCreateMeetingNoteInput,
  toGeneratedMeetingNoteFormValues,
  toMeetingNoteFormValues,
  toUpdateMeetingNoteInput,
  type MeetingNoteFormValues,
} from "@/features/meeting-note/schemas/meeting-note-schema";
import type { MeetingNote } from "@/features/meeting-note/types/meeting-note";
import { getApiErrorMessage } from "@/lib/api-client";

type MeetingNoteEditorScreenProps = {
  readonly meetingNoteId?: string;
};

export function MeetingNoteEditorScreen({
  meetingNoteId,
}: MeetingNoteEditorScreenProps) {
  const isEdit = Boolean(meetingNoteId);
  const navigate = useNavigate();
  const location = useLocation();
  const detailQuery = useMeetingNoteDetail(meetingNoteId ?? "", isEdit);
  const generateMutation = useGenerateMeetingNoteMutation();
  const createMutation = useCreateMeetingNoteMutation();
  const updateMutation = useUpdateMeetingNoteMutation();
  const linkMutation = useLinkMeetingNoteToDealMutation();
  const [rawText, setRawText] = useState("");
  const [rawTextError, setRawTextError] = useState<string | null>(null);
  const [notice, setNotice] = useState(() => readLocationMessage(location.state, "notice"));
  const [linkError, setLinkError] = useState(() =>
    readLocationMessage(location.state, "linkError")
  );
  const [savedMeetingNote, setSavedMeetingNote] = useState<MeetingNote | null>(
    null
  );
  const [initializedKey, setInitializedKey] = useState("");
  const {
    register,
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MeetingNoteFormValues>({
    resolver: zodResolver(meetingNoteFormSchema),
    defaultValues: emptyMeetingNoteFormValues,
  });
  const dealId = useWatch({ control, name: "dealId" }) ?? "";
  const dealSearch = useWatch({ control, name: "dealSearch" }) ?? "";
  const dealOptionsQuery = useMeetingNoteDealOptions(dealSearch);
  const effectiveMeetingNoteId = meetingNoteId ?? savedMeetingNote?.id ?? "";
  const isCurrentDealSelected = Boolean(
    savedMeetingNote?.dealId && savedMeetingNote.dealId === dealId
  );
  const actionError =
    createMutation.error ??
    updateMutation.error ??
    generateMutation.error ??
    detailQuery.error ??
    null;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isLinking = linkMutation.isPending;

  useEffect(() => {
    if (isEdit) {
      const detail = detailQuery.data;

      if (detail && initializedKey !== detail.meetingNote.id) {
        reset(toMeetingNoteFormValues(detail, null));
        setRawText(detail.rawText);
        setSavedMeetingNote(detail.meetingNote);
        setInitializedKey(detail.meetingNote.id);
      }

      return;
    }

    if (initializedKey !== "new") {
      reset(emptyMeetingNoteFormValues);
      setRawText("");
      setSavedMeetingNote(null);
      setInitializedKey("new");
    }
  }, [detailQuery.data, initializedKey, isEdit, reset]);

  const onGenerate = async () => {
    const normalizedRawText = rawText.trim();

    if (!normalizedRawText) {
      setRawTextError("AI 생성을 위해 회의 원문을 입력해주세요.");
      return;
    }

    setRawTextError(null);
    setLinkError(null);

    const currentValues = getValues();
    const generated = await generateMutation.mutateAsync({
      rawText: normalizedRawText,
      meetingDate: toOptionalIso(currentValues.meetingDate),
      companyHint: toOptionalText(currentValues.companyName),
      contactHint: toOptionalText(currentValues.contactName),
    });

    reset(toGeneratedMeetingNoteFormValues(generated, currentValues));
    setNotice("AI 결과를 생성했습니다. 저장 전에 내용을 확인해주세요.");
  };

  const onSubmit = handleSubmit(async (values) => {
    const normalizedRawText = rawText.trim();

    if (!normalizedRawText) {
      setRawTextError("회의 원문은 저장 시 필요합니다.");
      return;
    }

    setRawTextError(null);
    setLinkError(null);

    if (isEdit && meetingNoteId) {
      const updated = await updateMutation.mutateAsync(
        toUpdateMeetingNoteInput(meetingNoteId, normalizedRawText, values)
      );
      setSavedMeetingNote(updated);
      setNotice("회의록이 수정되었습니다.");
      return;
    }

    const created = await createMutation.mutateAsync(
      toCreateMeetingNoteInput(normalizedRawText, values)
    );
    setSavedMeetingNote(created);

    if (values.dealId?.trim()) {
      try {
        const linked = await linkMutation.mutateAsync({
          meetingNoteId: created.id,
          dealId: values.dealId.trim(),
          activityTitle: createActivityTitle(values),
        });
        navigate(`/meeting-notes/${linked.id}`, {
          replace: true,
          state: { notice: "회의록 저장과 딜 연결이 완료되었습니다." },
        });
      } catch (error) {
        navigate(`/meeting-notes/${created.id}`, {
          replace: true,
          state: {
            notice: "회의록은 저장되었습니다.",
            linkError: `딜 연결에 실패했습니다. ${getApiErrorMessage(error)}`,
          },
        });
      }

      return;
    }

    navigate(`/meeting-notes/${created.id}`, {
      replace: true,
      state: { notice: "회의록이 저장되었습니다." },
    });
  });

  const onLinkDeal = async () => {
    if (!effectiveMeetingNoteId || !dealId.trim()) {
      setLinkError("연결할 딜을 선택해주세요.");
      return;
    }

    if (isCurrentDealSelected) {
      setNotice("이미 연결된 딜입니다.");
      return;
    }

    setLinkError(null);
    const linked = await linkMutation.mutateAsync({
      meetingNoteId: effectiveMeetingNoteId,
      dealId: dealId.trim(),
      activityTitle: createActivityTitle(getValues()),
    });
    setSavedMeetingNote(linked);
    setValue("dealSearch", linked.dealTitle ?? "", { shouldValidate: true });
    setNotice("딜 연결이 완료되었습니다. 딜 활동 로그에 반영됩니다.");
  };

  const onDealSelect = (option: { readonly id: string; readonly name: string }) => {
    setValue("dealId", option.id, { shouldValidate: true });
    setValue("dealSearch", option.name, { shouldValidate: true });
  };

  const clearDeal = () => {
    setValue("dealId", "", { shouldValidate: true });
    setValue("dealSearch", "", { shouldValidate: true });
  };

  if (detailQuery.isLoading && isEdit) {
    return <MeetingNoteEditorSkeleton />;
  }

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            to="/meeting-notes"
          >
            <ArrowLeft className="h-4 w-4" />
            회의록 목록
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">
            {isEdit ? "회의록 상세" : "AI 회의록 작성"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            원문을 입력하고 AI 결과를 수정한 뒤 저장합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={generateMutation.isPending}
            onClick={() => void onGenerate()}
            type="button"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI 생성
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || isLinking}
            form="meeting-note-form"
            type="submit"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "수정 저장" : "저장"}
          </button>
        </div>
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {linkError ? (
        <ErrorMessage message={linkError} onDismiss={() => setLinkError(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <form className="grid gap-5" id="meeting-note-form" onSubmit={onSubmit}>
        <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
          <section className="grid gap-3 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">회의 원문</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  원문은 저장 시 암호화되며 화면 로그로 출력하지 않습니다.
                </p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <textarea
              aria-describedby={rawTextError ? "meeting-raw-error" : undefined}
              aria-invalid={Boolean(rawTextError)}
              className="min-h-[420px] resize-y rounded-md border px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => setRawText(event.target.value)}
              placeholder="회의 내용을 그대로 붙여넣거나 간단히 메모하세요."
              value={rawText}
            />
            {rawTextError ? (
              <p className="text-xs text-destructive" id="meeting-raw-error">
                {rawTextError}
              </p>
            ) : null}
          </section>

          <section className="grid gap-5 rounded-lg border bg-white p-4">
            <div>
              <h2 className="text-base font-semibold">AI 정리 항목</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                저장 전 9개 항목을 직접 수정할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                errorMessage={errors.meetingDate?.message}
                id="meeting-date"
                label="날짜"
                register={register("meetingDate")}
                type="datetime-local"
              />
              <TextField
                errorMessage={errors.companyName?.message}
                id="meeting-company"
                label="회사"
                register={register("companyName")}
              />
              <TextField
                errorMessage={errors.contactName?.message}
                id="meeting-contact"
                label="담당자"
                register={register("contactName")}
              />
              <TextField
                errorMessage={errors.department?.message}
                id="meeting-department"
                label="부서"
                register={register("department")}
              />
              <TextField
                errorMessage={errors.productName?.message}
                id="meeting-product"
                label="품목"
                register={register("productName")}
              />
              <TextField
                errorMessage={errors.stageText?.message}
                id="meeting-stage"
                label="진행단계"
                register={register("stageText")}
              />
            </div>

            <TextAreaField
              errorMessage={errors.details?.message}
              id="meeting-details"
              label="상세내용"
              register={register("details")}
              rows={6}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextAreaField
                errorMessage={errors.nextPlan?.message}
                id="meeting-next-plan"
                label="향후계획"
                register={register("nextPlan")}
                rows={4}
              />
              <TextAreaField
                errorMessage={errors.requiredAction?.message}
                id="meeting-required-action"
                label="필요액션"
                register={register("requiredAction")}
                rows={4}
              />
            </div>
          </section>
        </div>

        <section className="grid gap-4 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">딜 연결</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                회의록은 딜 없이 저장할 수 있고, 저장 후 연결 시 활동 로그가 생성됩니다.
              </p>
            </div>
            {savedMeetingNote?.dealId ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                <Link2 className="h-3.5 w-3.5" />
                {savedMeetingNote.dealTitle ?? "딜 연결됨"}
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <DealSearchField
              errorMessage={errors.dealId?.message}
              isLoading={dealOptionsQuery.isFetching}
              onClear={clearDeal}
              onSearchChange={(value) =>
                setValue("dealSearch", value, { shouldValidate: true })
              }
              onSelect={onDealSelect}
              options={dealOptionsQuery.data ?? []}
              search={dealSearch}
              selectedId={dealId}
            />
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!effectiveMeetingNoteId || !dealId || isCurrentDealSelected || isLinking}
              onClick={() => void onLinkDeal()}
              type="button"
            >
              {isLinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BriefcaseBusiness className="h-4 w-4" />
              )}
              {isCurrentDealSelected ? "연결됨" : "딜 연결"}
            </button>
          </div>
        </section>
      </form>
    </section>
  );
}

function DealSearchField({
  search,
  selectedId,
  options,
  isLoading,
  errorMessage,
  onSearchChange,
  onSelect,
  onClear,
}: {
  readonly search: string;
  readonly selectedId: string;
  readonly options: readonly { readonly id: string; readonly name: string; readonly subtitle: string }[];
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly onSearchChange: (search: string) => void;
  readonly onSelect: (option: { readonly id: string; readonly name: string }) => void;
  readonly onClear: () => void;
}) {
  const shouldShowOptions = search.trim().length > 0 && !selectedId;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor="meeting-deal-search">
        연결할 딜
      </label>
      <div className="relative">
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-describedby={errorMessage ? "meeting-deal-error" : undefined}
          aria-invalid={Boolean(errorMessage)}
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="meeting-deal-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="딜 검색"
          value={search}
        />
        {selectedId || search ? (
          <button
            aria-label="딜 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={onClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {shouldShowOptions ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              검색된 딜이 없습니다.
            </p>
          ) : (
            options.map((option) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={option.id}
                onClick={() => onSelect(option)}
                type="button"
              >
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">
                  {option.subtitle || "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs text-destructive" id="meeting-deal-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function TextField({
  id,
  label,
  register,
  errorMessage,
  type = "text",
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly type?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        type={type}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  register,
  errorMessage,
  rows,
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly rows: number;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="resize-y rounded-md border px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
        id={id}
        rows={rows}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function NoticeMessage({
  message,
  onDismiss,
}: {
  readonly message: string;
  readonly onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      <button
        aria-label="알림 닫기"
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-emerald-100"
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ErrorMessage({
  message,
  onDismiss,
}: {
  readonly message: string;
  readonly onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
      <span className="inline-flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {message}
      </span>
      {onDismiss ? (
        <button
          aria-label="오류 닫기"
          className="grid h-7 w-7 place-items-center rounded-md hover:bg-red-100"
          onClick={onDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function MeetingNoteEditorSkeleton() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <div className="h-20 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <div className="h-[520px] animate-pulse rounded-lg bg-muted" />
        <div className="h-[520px] animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

function readLocationMessage(state: unknown, key: "notice" | "linkError") {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return null;
  }

  const record = state as Record<string, unknown>;
  const value = record[key];

  return typeof value === "string" ? value : null;
}

function toOptionalIso(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

function createActivityTitle(values: MeetingNoteFormValues) {
  const title = [values.companyName?.trim(), values.details.trim()]
    .filter(Boolean)
    .join(" · ");

  return title ? `회의록 연결: ${title.slice(0, 80)}` : "회의록 연결";
}
