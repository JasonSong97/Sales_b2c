import {
  ArchiveRestore,
  IdCard,
  Plus,
  ScanLine,
  Search,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import { useContactList } from "@/features/contact/hooks/use-contact-list";
import {
  useDeleteContactMutation,
  useRestoreContactMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import type { Contact } from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/utils/format";

export function ContactListScreen() {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const contactsQuery = useContactList({
    page: 1,
    pageSize: 20,
    search: search || undefined,
    companyId: companyId || undefined,
    includeDeleted,
  });
  const deleteContactMutation = useDeleteContactMutation();
  const restoreContactMutation = useRestoreContactMutation();
  const actionError =
    deleteContactMutation.error ?? restoreContactMutation.error ?? null;
  const contactList = contactsQuery.data;

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
  };

  const onDelete = async (contact: Contact) => {
    if (!window.confirm(`${contact.name} 거래처를 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteContactMutation.mutateAsync(contact.id);
    setNotice("거래처가 휴지통으로 이동되었습니다.");
  };

  const onRestore = async (contact: Contact) => {
    await restoreContactMutation.mutateAsync(contact.id);
    setNotice("거래처가 복구되었습니다.");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">거래처</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            담당자와 회사 연결 정보를 관리합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            to="/contacts/scan"
          >
            <ScanLine className="h-4 w-4" />
            명함 스캔
          </Link>
          <button
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            거래처 추가
          </button>
        </div>
      </header>

      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)_auto]"
        onSubmit={onSearchSubmit}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="이름, 회사명, 전화번호, 이메일 검색"
            value={searchText}
          />
        </div>
        <ContactCompanyField
          companyId={companyId}
          id="contact-company-filter"
          label="회사 필터"
          onCompanyIdChange={setCompanyId}
          onSearchChange={setCompanySearch}
          search={companySearch}
        />
        <div className="flex flex-wrap items-end gap-2">
          <label className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <input
              checked={includeDeleted}
              className="h-4 w-4 rounded border"
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              type="checkbox"
            />
            삭제 포함
          </label>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <Search className="h-4 w-4" />
            검색
          </button>
        </div>
      </form>

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

      {contactsQuery.isLoading ? (
        <ContactListSkeleton />
      ) : contactsQuery.isError ? (
        <ContactListError
          error={contactsQuery.error}
          onRetry={() => void contactsQuery.refetch()}
        />
      ) : !contactList || contactList.items.length === 0 ? (
        <ContactEmptyState
          hasSearch={search.length > 0 || companyId.length > 0}
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <ContactListContent
          contacts={contactList.items}
          isMutating={
            deleteContactMutation.isPending || restoreContactMutation.isPending
          }
          onDelete={onDelete}
          onRestore={onRestore}
        />
      )}

      <ContactCreateDialog
        onCreated={(contact) => setNotice(`${contact.name} 거래처가 추가되었습니다.`)}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type ContactListContentProps = {
  readonly contacts: Contact[];
  readonly isMutating: boolean;
  readonly onDelete: (contact: Contact) => Promise<void>;
  readonly onRestore: (contact: Contact) => Promise<void>;
};

function ContactListContent({
  contacts,
  isMutating,
  onDelete,
  onRestore,
}: ContactListContentProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.9fr_1fr_0.8fr_1fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>이름</span>
          <span>회사명</span>
          <span>부서</span>
          <span>직책</span>
          <span>전화번호</span>
          <span>이메일</span>
          <span>최근 수정일</span>
          <span className="text-right">작업</span>
        </div>
        {contacts.map((contact) => (
          <div
            className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.9fr_1fr_0.8fr_1fr] items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/50"
            key={contact.id}
          >
            <Link
              className="min-w-0 font-medium text-slate-950 hover:text-primary"
              to={`/contacts/${contact.id}`}
            >
              <span className="block truncate">{contact.name}</span>
            </Link>
            <span className="truncate text-slate-700">
              {contact.companyName ?? "회사 없음"}
            </span>
            <span className="truncate text-slate-700">
              {contact.department ?? "-"}
            </span>
            <span className="truncate text-slate-700">
              {contact.position ?? "-"}
            </span>
            <span className="truncate text-slate-700">{contact.phone ?? "-"}</span>
            <span className="truncate text-slate-700">{contact.email ?? "-"}</span>
            <span className="text-slate-700">
              {formatDate(contact.updatedAt, { year: "2-digit" })}
            </span>
            <ContactRowActions
              contact={contact}
              isMutating={isMutating}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {contacts.map((contact) => (
          <article className="rounded-lg border bg-white p-4" key={contact.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="block truncate text-base font-semibold hover:text-primary"
                  to={`/contacts/${contact.id}`}
                >
                  {contact.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.companyName ?? "회사 없음"}
                </p>
              </div>
              <ContactStatusBadge contact={contact} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Field label="부서" value={contact.department} />
              <Field label="직책" value={contact.position} />
              <Field label="전화번호" value={contact.phone} />
              <Field label="이메일" value={contact.email} />
            </dl>
            <div className="mt-4 flex justify-end">
              <ContactRowActions
                contact={contact}
                isMutating={isMutating}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type ContactRowActionsProps = {
  readonly contact: Contact;
  readonly isMutating: boolean;
  readonly onDelete: (contact: Contact) => Promise<void>;
  readonly onRestore: (contact: Contact) => Promise<void>;
};

function ContactRowActions({
  contact,
  isMutating,
  onDelete,
  onRestore,
}: ContactRowActionsProps) {
  const isDeleted = contact.deletedAt !== null;

  return (
    <div className="flex justify-end gap-2">
      {isDeleted ? (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onRestore(contact)}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      ) : (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onDelete(contact)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      )}
    </div>
  );
}

function ContactStatusBadge({ contact }: { readonly contact: Contact }) {
  if (contact.deletedAt) {
    return (
      <span className="inline-flex h-7 w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-800">
        삭제됨
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-800">
      활성
    </span>
  );
}

function Field({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-medium">{value ?? "-"}</dd>
    </div>
  );
}

function ContactListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.9fr_1fr_0.8fr_1fr] gap-4 border-b px-4 py-4 last:border-b-0"
          key={index}
        >
          {Array.from({ length: 8 }, (__, cellIndex) => (
            <div
              className="h-5 animate-pulse rounded bg-muted"
              key={cellIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ContactListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-white px-5 py-8 text-center">
      <IdCard className="mx-auto h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">거래처를 불러오지 못했습니다.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
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
    </div>
  );
}

function ContactEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-white px-5 py-10 text-center">
      <IdCard className="mx-auto h-9 w-9 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">
          {hasSearch ? "검색 결과가 없습니다" : "등록된 거래처가 없습니다"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          거래처를 추가하면 회사와 딜 흐름을 연결할 수 있습니다.
        </p>
      </div>
      <button
        className="mx-auto inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-4 w-4" />
        거래처 추가
      </button>
    </div>
  );
}
