import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
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
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import {
  companyCreateFormSchema,
  emptyCompanyCreateFormValues,
  toCreateCompanyInput,
  type CompanyCreateFormValues,
} from "@/features/company/schemas/company-schema";
import type {
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyCreateDialogProps = {
  readonly open: boolean;
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: () => void;
};

// 기능 : 회사 생성 모달을 렌더링합니다.
export function CompanyCreateDialog({
  open,
  fields,
  regions,
  onOpenChange,
  onCreated,
}: CompanyCreateDialogProps) {
  const createCompanyMutation = useCreateCompanyMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyCreateFormValues>({
    resolver: zodResolver(companyCreateFormSchema),
    defaultValues: emptyCompanyCreateFormValues,
  });
  const formId = "company-create-form";

  useEffect(() => {
    if (open) {
      reset(emptyCompanyCreateFormValues);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  // 기능 : 회사 생성 요청을 보내고 성공 시 모달을 닫습니다.
  const onSubmit = handleSubmit(async (values) => {
    await createCompanyMutation.mutateAsync(toCreateCompanyInput(values));
    onCreated();
    onOpenChange(false);
  });

  return (
    <ModalShell
      description="회사명, 분야, 지역을 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createCompanyMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="회사 추가"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="회사명과 분류 기준을 먼저 저장합니다."
          title="회사 기본 정보"
        >
          <ModalFieldGroup
            error={errors.companyName?.message}
            id="company-name"
            label="회사명"
          >
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-describedby={
                    errors.companyName ? "company-name-error" : undefined
                  }
                  aria-invalid={Boolean(errors.companyName)}
                  className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="company-name"
                  {...register("companyName")}
                />
              </div>
          </ModalFieldGroup>

          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.companyFieldId?.message}
              id="company-field-id"
              label="분야"
            >
                <select
                  aria-describedby={
                    errors.companyFieldId ? "company-field-id-error" : undefined
                  }
                  aria-invalid={Boolean(errors.companyFieldId)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="company-field-id"
                  {...register("companyFieldId")}
                >
                  <option value="">분야 선택</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.field}
                    </option>
                  ))}
                </select>
            </ModalFieldGroup>

            <ModalFieldGroup
              error={errors.companyRegionId?.message}
              id="company-region-id"
              label="지역"
            >
                <select
                  aria-describedby={
                    errors.companyRegionId
                      ? "company-region-id-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.companyRegionId)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="company-region-id"
                  {...register("companyRegionId")}
                >
                  <option value="">지역 선택</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.region}
                    </option>
                  ))}
                </select>
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection
          description="입력하면 첫 회사 메모 로그로 저장됩니다."
          title="첫 메모"
        >
          <ModalFieldGroup
            helper="회사 기본 정보 필드는 아닙니다."
            id="company-memo"
            label="첫 회사 메모"
          >
              <textarea
                className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="company-memo"
                {...register("companyMemo")}
              />
          </ModalFieldGroup>
        </ModalFormSection>

        {createCompanyMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createCompanyMutation.error)}
            title="회사 저장 실패"
            variant="inline"
          />
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}
