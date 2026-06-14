import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

export const DEFAULT_USER_TIME_ZONE = "Asia/Seoul";

type IntlWithSupportedValues = typeof Intl & {
  readonly supportedValuesOf?: (key: "timeZone") => string[];
};

// 기능 : IANA timezone ID인지 표준 Intl API로 검증합니다.
export function isValidIanaTimeZone(timeZone: string): boolean {
  const supportedValuesOf = (Intl as IntlWithSupportedValues).supportedValuesOf;

  if (supportedValuesOf) {
    return supportedValuesOf("timeZone").includes(timeZone) || timeZone === "UTC";
  }

  try {
    const resolvedTimeZone = new Intl.DateTimeFormat("en-US", {
      timeZone,
    }).resolvedOptions().timeZone;

    return resolvedTimeZone === timeZone;
  } catch {
    return false;
  }
}

// 기능 : 선택 입력 timezone을 trim하고 저장 가능한 IANA timezone ID로 검증합니다.
export function normalizeOptionalIanaTimeZone(
  timeZone: string | undefined
): string | undefined {
  if (timeZone === undefined) {
    return undefined;
  }

  const trimmed = timeZone.trim();

  if (!trimmed || !isValidIanaTimeZone(trimmed)) {
    throw new ValidationDomainError("timeZone must be a valid IANA timezone ID");
  }

  return trimmed;
}
