type DateFormatOptions = {
  readonly fallback?: string;
  readonly includeYear?: boolean;
  readonly year?: "2-digit" | "numeric";
};
type DateValue = Date | string | null | undefined;
type CustomDateFormatOptions = Intl.DateTimeFormatOptions & {
  readonly fallback?: string;
};

const DEFAULT_FALLBACK = "-";
const LOCALE = "ko-KR";

export function formatDateWithOptions(
  value: DateValue,
  options: CustomDateFormatOptions
) {
  if (!value) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : String(value);
  }

  return new Intl.DateTimeFormat(LOCALE, {
    ...options,
  }).format(date);
}

export function formatDate(
  value: DateValue,
  options: DateFormatOptions = {}
) {
  return formatDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" }
        : {}),
    fallback: options.fallback,
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(
  value: DateValue,
  options: DateFormatOptions = {}
) {
  return formatDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" }
        : {}),
    fallback: options.fallback,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(LOCALE, {
      currency,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(LOCALE)} ${currency}`;
  }
}
