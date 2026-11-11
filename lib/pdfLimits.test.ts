import { checkPdfFile, formatFileSize, MAX_PDF_BYTES, PDF_TOO_LARGE_MESSAGE } from "./pdfLimits";

describe("checkPdfFile", () => {
  const pdf = (size: number, name = "guide.pdf", type = "application/pdf") => ({ name, size, type });

  it("accepts a normal PDF", () => {
    expect(checkPdfFile(pdf(800 * 1024))).toBeNull();
  });

  it("accepts a PDF exactly at the limit", () => {
    expect(checkPdfFile(pdf(MAX_PDF_BYTES))).toBeNull();
  });

  it("rejects a PDF one byte over the limit and says how big it is", () => {
    const message = checkPdfFile(pdf(MAX_PDF_BYTES + 1));
    expect(message).toContain(PDF_TOO_LARGE_MESSAGE);
    expect(message).toContain("4.0 MB");
  });

  it("rejects a large PDF with its size", () => {
    expect(checkPdfFile(pdf(12 * 1024 * 1024))).toBe(`${PDF_TOO_LARGE_MESSAGE} This file is 12.0 MB.`);
  });

  it("rejects an empty file", () => {
    expect(checkPdfFile(pdf(0))).toBe("This PDF is empty.");
  });

  it("accepts a .pdf file the browser gave no type for", () => {
    expect(checkPdfFile(pdf(1024, "Manual.PDF", ""))).toBeNull();
  });

  it("rejects files that aren't PDFs", () => {
    expect(checkPdfFile(pdf(1024, "photo.png", "image/png"))).toBe("Only PDF files can be uploaded.");
  });
});

describe("formatFileSize", () => {
  it("shows small files in KB, never 0 KB", () => {
    expect(formatFileSize(100)).toBe("1 KB");
    expect(formatFileSize(820 * 1024)).toBe("820 KB");
  });

  it("shows files from 1 MB up in MB", () => {
    expect(formatFileSize(5.3 * 1024 * 1024)).toBe("5.3 MB");
  });
});
