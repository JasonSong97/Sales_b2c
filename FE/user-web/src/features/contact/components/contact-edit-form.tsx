import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { ContactCompanyField } from "@/features/contact/components/contact-company-field";
import { useUpdateContactMutation } from "@/features/contact/hooks/use-contact-mutations";
import {
  contactFormSchema,
  toContactFormValues,
  toUpdateContactInput,
  type ContactFormValues,
} from "@/features/contact/schemas/contact-schema";
import type { Contact } from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";

type ContactEditFormProps = {
  readonly contact: Contact;
  readonly onSaved: (contact: Contact) => void;
};

export function ContactEditForm({ contact, onSaved }: ContactEditFormProps) {
  const updateContactMutation = useUpdateContactMutation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: toContactFormValues(contact),
  });
  const companyId = watch("companyId") ?? "";
  const companySearch = watch("companySearch") ?? "";

  useEffect(() => {
    reset(toContactFormValues(contact));
  }, [contact, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const updatedContact = await updateContactMutation.mutateAsync(
      toUpdateContactInput(contact.id, values)
    );

    onSaved(updatedContact);
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <TextInput
        error={errors.name?.message}
        id="contact-detail-name"
        label="이름"
        register={register("name")}
      />

      <ContactCompanyField
        companyId={companyId}
        id="contact-detail-company"
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
        <TextInput id="contact-detail-department" label="부서" register={register("department")} />
        <TextInput id="contact-detail-position" label="직책" register={register("position")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          error={errors.phone?.message}
          id="contact-detail-phone"
          label="전화번호"
          register={register("phone")}
        />
        <TextInput
          error={errors.email?.message}
          id="contact-detail-email"
          label="이메일"
          register={register("email")}
        />
      </div>

      <TextInput id="contact-detail-address" label="위치" register={register("address")} />

      {updateContactMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateContactMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateContactMutation.isPending}
          type="submit"
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>
    </form>
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
