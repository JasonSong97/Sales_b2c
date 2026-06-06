import * as XLSX from "xlsx";
import { XlsxExportFileGeneratorAdapter } from "./xlsx-export-file-generator.adapter";

describe("XlsxExportFileGeneratorAdapter", () => {
  it("generates an xlsx workbook with Korean headers and rows", async () => {
    const adapter = new XlsxExportFileGeneratorAdapter();

    const generated = await adapter.generate({
      format: "EXCEL",
      data: {
        targetType: "COMPANY",
        headers: ["회사명", "업종"],
        rows: [["한빛리빙", "생활가전"]],
      },
    });
    const workbook = XLSX.read(generated.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ""];
    const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      raw: false,
    });

    expect(generated.contentType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(matrix[0]).toEqual(["회사명", "업종"]);
    expect(matrix[1]).toEqual(["한빛리빙", "생활가전"]);
  });

  it("generates a placeholder pdf for PDF exports", async () => {
    const adapter = new XlsxExportFileGeneratorAdapter();

    const generated = await adapter.generate({
      format: "PDF",
      data: {
        targetType: "DEAL",
        headers: ["딜명"],
        rows: [["리빙 납품"]],
      },
    });

    expect(generated.contentType).toBe("application/pdf");
    expect(generated.fileName.endsWith(".pdf")).toBe(true);
    expect(generated.buffer.toString("utf8")).toContain(
      "DEAL export placeholder"
    );
  });
});
