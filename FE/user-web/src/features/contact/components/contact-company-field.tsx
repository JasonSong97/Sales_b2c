import { Building2, X } from "lucide-react";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";

type ContactCompanyFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly companyId: string;
  readonly search: string;
  readonly onCompanyIdChange: (companyId: string) => void;
  readonly onSearchChange: (search: string) => void;
};

export function ContactCompanyField({
  id,
  label,
  companyId,
  search,
  onCompanyIdChange,
  onSearchChange,
}: ContactCompanyFieldProps) {
  const companyOptionsQuery = useCompanyOptions(search);
  const companies = companyOptionsQuery.data?.items ?? [];

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            onCompanyIdChange("");
          }}
          value={search}
        />
        {companyId || search ? (
          <button
            aria-label="회사 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => {
              onCompanyIdChange("");
              onSearchChange("");
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {search.trim().length > 0 ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {companyOptionsQuery.isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중</p>
          ) : companies.length === 0 ? (
            <button
              className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
              onClick={() => {
                onCompanyIdChange("");
                onSearchChange(search);
              }}
              type="button"
            >
              회사 없이 저장
            </button>
          ) : (
            companies.map((company) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={company.id}
                onClick={() => {
                  onCompanyIdChange(company.id);
                  onSearchChange(company.name);
                }}
                type="button"
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {[company.industry, company.region].filter(Boolean).join(" · ") ||
                    "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
