import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import {
  isValidIanaTimeZone,
  normalizeOptionalIanaTimeZone,
} from "./time-zone";

// 기능 : IANA timezone 검증 helper의 허용/거부 기준을 고정합니다.
describe("time-zone helpers", () => {
  it.each(["Asia/Seoul", "Asia/Singapore", "America/Los_Angeles"])(
    "accepts %s",
    (timeZone) => {
      expect(isValidIanaTimeZone(timeZone)).toBe(true);
      expect(normalizeOptionalIanaTimeZone(` ${timeZone} `)).toBe(timeZone);
    }
  );

  it.each(["", "KST", "PST", "EST", "GMT+9"])(
    "rejects %s",
    (timeZone) => {
      expect(isValidIanaTimeZone(timeZone)).toBe(false);
      expect(() => normalizeOptionalIanaTimeZone(timeZone)).toThrow(
        ValidationDomainError
      );
    }
  );
});
