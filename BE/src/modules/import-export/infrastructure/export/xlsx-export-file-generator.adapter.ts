import * as XLSX from "xlsx";
import type {
  ExportDataTable,
  ExportFileGeneratorPort,
  GeneratedExportFile,
  GenerateExportFileInput,
} from "@/modules/import-export/application/ports/export-file-generator.port";

const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export class XlsxExportFileGeneratorAdapter implements ExportFileGeneratorPort {
  async generate(input: GenerateExportFileInput): Promise<GeneratedExportFile> {
    if (input.format === "PDF") {
      return generatePlaceholderPdf(input.data);
    }

    const worksheet = XLSX.utils.aoa_to_sheet([
      input.data.headers,
      ...input.data.rows.map((row) => row.map((cell) => cell ?? "")),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    return {
      fileName: `${toFileSlug(input.data.targetType)}-${toTimestamp()}.xlsx`,
      contentType: EXCEL_CONTENT_TYPE,
      buffer,
    };
  }
}

function generatePlaceholderPdf(data: ExportDataTable): GeneratedExportFile {
  const lines = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj",
    "4 0 obj << /Length 85 >> stream",
    "BT /F1 12 Tf 72 720 Td",
    `(${data.targetType} export placeholder - ${data.rows.length} rows) Tj`,
    "ET",
    "endstream endobj",
    "xref",
    "0 5",
    "0000000000 65535 f ",
    "trailer << /Root 1 0 R /Size 5 >>",
    "startxref",
    "0",
    "%%EOF",
  ];

  return {
    fileName: `${toFileSlug(data.targetType)}-${toTimestamp()}.pdf`,
    contentType: "application/pdf",
    buffer: Buffer.from(lines.join("\n"), "utf8"),
  };
}

function toFileSlug(value: string): string {
  return value.toLowerCase().replaceAll("_", "-");
}

function toTimestamp(): string {
  return new Date().toISOString().replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}
