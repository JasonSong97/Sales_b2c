import { Buffer } from "node:buffer";
import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import type {
  XlsxColumnDefinition,
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";

// 역할 : ExceljsXlsxWorkbookWriter ExcelJS 기반 xlsx 파일 생성을 담당합니다.
@Injectable()
export class ExceljsXlsxWorkbookWriter implements XlsxWorkbookWriter {
  // 기능 : 단일 워크시트를 가진 xlsx 파일 Buffer를 생성합니다.
  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "onehand-sales-backend";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(input.sheetName);
    worksheet.columns = input.columns.map((column) =>
      this.toExcelColumn(column)
    );
    worksheet.addRows(input.rows.map((row) => ({ ...row })));
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const data = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(data) ? data : Buffer.from(data);
  }

  // 기능 : application 컬럼 정의를 ExcelJS 컬럼 정의로 변환합니다.
  private toExcelColumn(column: XlsxColumnDefinition): Partial<ExcelJS.Column> {
    return {
      header: column.header,
      key: column.key,
      ...(column.width !== undefined ? { width: column.width } : {}),
      ...(column.numFmt !== undefined
        ? {
            style: {
              numFmt: column.numFmt,
            },
          }
        : {}),
    };
  }
}
