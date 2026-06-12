import { Module } from "@nestjs/common";
import { XLSX_WORKBOOK_WRITER } from "@/shared/application/ports/xlsx-workbook.writer";
import { ExceljsXlsxWorkbookWriter } from "./exceljs-xlsx-workbook.writer";

// 역할 : XlsxInfrastructureModule xlsx writer provider를 공유합니다.
@Module({
  providers: [
    ExceljsXlsxWorkbookWriter,
    {
      provide: XLSX_WORKBOOK_WRITER,
      useExisting: ExceljsXlsxWorkbookWriter,
    },
  ],
  exports: [XLSX_WORKBOOK_WRITER],
})
export class XlsxInfrastructureModule {}
