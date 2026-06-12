import { Buffer } from "node:buffer";

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// 역할 : ExportedXlsxFileResponse xlsx 다운로드 응답에 필요한 파일 정보를 정의합니다.
export interface ExportedXlsxFileResponse {
  readonly fileName: string;
  readonly contentType: string;
  readonly content: Buffer;
}

// 기능 : 현재 시각을 포함한 xlsx 파일명을 생성합니다.
export function createTimestampedXlsxFileName(
  prefix: string,
  now = new Date()
): string {
  const year = now.getFullYear().toString();
  const month = padDatePart(now.getMonth() + 1);
  const day = padDatePart(now.getDate());
  const hour = padDatePart(now.getHours());
  const minute = padDatePart(now.getMinutes());
  const second = padDatePart(now.getSeconds());

  return `${prefix}_${year}${month}${day}_${hour}${minute}${second}.xlsx`;
}

// 기능 : 파일명에 사용하는 날짜 숫자를 2자리 문자열로 변환합니다.
function padDatePart(value: number): string {
  return value.toString().padStart(2, "0");
}
