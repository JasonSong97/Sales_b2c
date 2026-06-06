import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useCreateContactMutation } from "@/features/contact/hooks/use-contact-mutations";
import {
  contactFormSchema,
  emptyContactFormValues,
  toCreateContactInput,
  type ContactFormValues,
} from "@/features/contact/schemas/contact-schema";
import type { Contact } from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";

type ContactCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (contact: Contact) => void;
};

export function ContactCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ContactCreateDialogProps) {
  const createContactMutation = useCreateContactMutation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyContactFormValues,
  });
  const companyId = watch("companyId") ?? "";
  const companySearch = watch("companySearch") ?? "";

  useEffect(() => {
    if (open) {
      reset(emptyContactFormValues);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    const contact = await createContactMutation.mutateAsync(
      toCreateContactInput(values)
    );

    onCreated(contact);
    onOpenChange(false);
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-xl"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">거래처 빠른 등록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              담당자 정보와 연결 회사를 저장합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="grid gap-4 px-5 py-5" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="contact-name">
              이름
            </label>
            <input
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-name"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive" id="contact-name-error">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <ContactCompanyField
            companyId={companyId}
            id="contact-company"
            label="회사"
            onCompanyIdChange={(value) =>
              setValue("companyId", value, { shouldDirty: true })
            }
            onSearchChange={(value) =>
              setValue("companySearch", value, { shouldDirty: true })
            }
            search={companySearch}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput id="contact-department" label="부서" register={register("department")} />
            <TextInput id="contact-position" label="직책" register={register("position")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              error={errors.phone?.message}
              id="contact-phone"
              label="전화번호"
              register={register("phone")}
            />
            <TextInput
              error={errors.email?.message}
              id="contact-email"
              label="이메일"
              register={register("email")}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="contact-memo">
              첫 메모
            </label>
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-memo"
              {...register("initialMemo")}
            />
          </div>

          {createContactMutation.error ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(createContactMutation.error)}
            </p>
          ) : null}

          <footer className="flex justify-end gap-2 border-t pt-4">
            <button
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              취소
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createContactMutation.isPending}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              저장
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

type TextInputProps = {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly register: UseFormRegisterReturn;
};

function TextInput({ id, label, error, register }: TextInputProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        {...register}
      />
      {error ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
