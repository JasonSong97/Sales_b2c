import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
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
  const formId = "contact-create-form";

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
    <ModalShell
      description="담당자 정보와 연결 회사를 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createContactMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="거래처 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="담당자 이름과 연결 회사를 지정합니다."
          title="거래처 기본 정보"
        >
          <ModalFieldGroup error={errors.name?.message} id="contact-name" label="이름">
            <input
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-name"
              {...register("name")}
            />
          </ModalFieldGroup>

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
        </ModalFormSection>

        <ModalFormSection title="상세 정보">
          <ModalFormRow columns={2}>
            <ModalFieldGroup id="contact-department" label="부서">
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-department"
                {...register("department")}
              />
            </ModalFieldGroup>
            <ModalFieldGroup id="contact-position" label="직책">
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-position"
                {...register("position")}
              />
            </ModalFieldGroup>
          </ModalFormRow>

          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.phone?.message}
              id="contact-phone"
              label="전화번호"
            >
              <input
                aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                aria-invalid={Boolean(errors.phone)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-phone"
                {...register("phone")}
              />
            </ModalFieldGroup>
            <ModalFieldGroup
              error={errors.email?.message}
              id="contact-email"
              label="이메일"
            >
              <input
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="contact-email"
                {...register("email")}
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="첫 메모">
          <ModalFieldGroup id="contact-memo" label="첫 메모">
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-memo"
              {...register("initialMemo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

          {createContactMutation.error ? (
            <ErrorState
              message={getApiErrorMessage(createContactMutation.error)}
              title="거래처 저장 실패"
              variant="inline"
            />
          ) : null}
      </ModalForm>
    </ModalShell>
  );
}
