import {
  ArchiveRestore,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Clipboard,
  IdCard,
  Mail,
  Package,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ContactEditForm } from "@/features/contact/components/contact-edit-form";
import { ContactLogSection } from "@/features/contact/components/contact-log-section";
import { useContactDetail, useContactLogs } from "@/features/contact/hooks/use-contact-detail";
import {
  useDeleteContactMutation,
  useRestoreContactMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import type { Contact, ContactMemo } from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";
import { isDeletedResourceReadError } from "@/utils/api-error";
import { formatDateTime } from "@/utils/format";

type ContactDetailScreenProps = {
  readonly contactId: string;
};

export function ContactDetailScreen({ contactId }: ContactDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const contactQuery = useContactDetail(contactId);
  const logsQuery = useContactLogs(contactId, { page: 1, pageSize: 20 });
  const deleteContactMutation = useDeleteContactMutation();
  const restoreContactMutation = useRestoreContactMutation();
  const actionError =
    deleteContactMutation.error ?? restoreContactMutation.error ?? null;

  const onDelete = async (contact: Contact) => {
    if (!window.confirm(`${contact.name} 거래처를 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteContactMutation.mutateAsync(contact.id);
    setNotice("거래처가 휴지통으로 이동되었습니다.");
  };

  const onRestore = async () => {
    const contact = await restoreContactMutation.mutateAsync(contactId);
    setNotice(`${contact.name} 거래처가 복구되었습니다.`);
  };

  if (contactQuery.isLoading) {
    return <ContactDetailSkeleton />;
  }

  if (contactQuery.isError) {
    if (isDeletedResourceReadError(contactQuery.error)) {
      return (
        <DeletedContactState
          error={contactQuery.error}
          isRestoring={restoreContactMutation.isPending}
          onRestore={onRestore}
        />
      );
    }

    return (
      <ContactDetailError
        error={contactQuery.error}
        onRetry={() => void contactQuery.refetch()}
      />
    );
  }

  const contactDetail = contactQuery.data;

  if (!contactDetail) {
    return <ContactDetailSkeleton />;
  }

  const { contact, company, memos, relatedDealCount, relatedProductCount } =
    contactDetail;
  const logs = logsQuery.data?.items ?? [];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            to="/contacts"
          >
            <ArrowLeft className="h-4 w-4" />
            거래처 목록
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{contact.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatContactSubtitle(contact)}
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-destructive/30 px-4 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={deleteContactMutation.isPending}
          onClick={() => void onDelete(contact)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          휴지통 이동
        </button>
      </header>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      ) : null}

      <RelatedSummary
        relatedDealCount={relatedDealCount}
        relatedProductCount={relatedProductCount}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold">기본 정보</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                담당자와 회사 연결 정보를 정리합니다.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <ContactEditForm
                contact={contact}
                onSaved={(updatedContact) =>
                  setNotice(`${updatedContact.name} 거래처가 저장되었습니다.`)
                }
              />
            </div>
          </section>

          <ContactLogSection
            contactId={contact.id}
            error={logsQuery.error}
            isLoading={logsQuery.isLoading}
            logs={logs}
            onChanged={setNotice}
            onRetry={() => void logsQuery.refetch()}
          />
        </div>

        <aside className="grid content-start gap-6">
          <ContactConnectionPanel company={company} />
          <ContactReachPanel contact={contact} onCopied={setNotice} />
          <ContactMemoPanel memos={memos} />
        </aside>
      </div>
    </section>
  );
}

function RelatedSummary({
  relatedDealCount,
  relatedProductCount,
}: {
  readonly relatedDealCount: number;
  readonly relatedProductCount: number;
}) {
  const items = [
    {
      label: "관련 딜",
      value: relatedDealCount,
      icon: BriefcaseBusiness,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    {
      label: "관련 제품",
      value: relatedProductCount,
      icon: Package,
      className: "border-amber-200 bg-amber-50 text-amber-900",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${item.className}`}
            key={item.label}
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
    </section>
  );
}

function ContactConnectionPanel({
  company,
}: {
  readonly company: { readonly id: string; readonly name: string } | null;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">연결 회사</h2>
      <div className="rounded-lg border bg-white p-4">
        {company ? (
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"
            to={`/companies/${company.id}`}
          >
            <Building2 className="h-4 w-4" />
            {company.name}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">연결된 회사가 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function ContactReachPanel({
  contact,
  onCopied,
}: {
  readonly contact: Contact;
  readonly onCopied: (message: string) => void;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">연락 정보</h2>
      <div className="grid gap-2 rounded-lg border bg-white p-4">
        <CopyRow
          icon={Phone}
          label="전화번호"
          onCopied={onCopied}
          value={contact.phone}
        />
        <CopyRow
          icon={Mail}
          label="이메일"
          onCopied={onCopied}
          value={contact.email}
        />
      </div>
    </section>
  );
}

function CopyRow({
  icon: Icon,
  label,
  value,
  onCopied,
}: {
  readonly icon: typeof Phone;
  readonly label: string;
  readonly value: string | null;
  readonly onCopied: (message: string) => void;
}) {
  const onCopy = async () => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    onCopied(`${label}를 복사했습니다.`);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium">{value ?? "-"}</p>
      </div>
      <button
        aria-label={`${label} 복사`}
        className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!value}
        onClick={() => void onCopy()}
        type="button"
      >
        <Clipboard className="h-4 w-4" />
      </button>
    </div>
  );
}

function ContactMemoPanel({ memos }: { readonly memos: ContactMemo[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">Memo 기록</h2>
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        메모는 민감정보 후보입니다.
      </p>
      <div className="overflow-hidden rounded-lg border bg-white">
        {memos.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            등록된 메모가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {memos.map((memo) => (
              <article className="grid gap-2 px-4 py-4" key={memo.id}>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(memo.memoDate, { includeYear: true })}
                </p>
                {memo.title ? (
                  <h3 className="text-sm font-semibold">{memo.title}</h3>
                ) : null}
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {memo.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DeletedContactState({
  error,
  isRestoring,
  onRestore,
}: {
  readonly error: unknown;
  readonly isRestoring: boolean;
  readonly onRestore: () => Promise<void>;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <IdCard className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">삭제된 거래처입니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Link
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          to="/contacts"
        >
          거래처 목록
        </Link>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRestoring}
          onClick={() => void onRestore()}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      </div>
    </section>
  );
}

function ContactDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <IdCard className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">거래처 상세를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <button
        className="mx-auto inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        재시도
      </button>
    </section>
  );
}

function ContactDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <div className="grid gap-2 border-b pb-5">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div className="h-24 animate-pulse rounded-lg bg-muted" key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

function formatContactSubtitle(contact: Contact) {
  return [contact.companyName, contact.department, contact.position]
    .filter(Boolean)
    .join(" · ") || "회사 없음";
}
