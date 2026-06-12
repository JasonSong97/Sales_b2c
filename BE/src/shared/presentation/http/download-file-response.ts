import { StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import type { ExportedXlsxFileResponse } from "@/shared/application/export/xlsx-export-file";

// 기능 : xlsx 파일 응답 헤더를 설정하고 다운로드용 StreamableFile을 생성합니다.
export function createXlsxDownloadResponse(
  response: Response,
  file: ExportedXlsxFileResponse
): StreamableFile {
  response.setHeader("Content-Type", file.contentType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.fileName}"`
  );
  response.setHeader("Content-Length", file.content.length.toString());

  return new StreamableFile(file.content);
}
