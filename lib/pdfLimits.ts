/**
 * PDF upload limit, shared by the upload screens (checked before anything is sent) and
 * /api/ingest-pdf (checked again on the server). Vercel caps request bodies at 4.5 MB, so the
 * limit stays just under that.
 */
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export const MAX_PDF_MB = MAX_PDF_BYTES / 1024 / 1024;

export const PDF_TOO_LARGE_MESSAGE = `PDF is too large. The limit is ${MAX_PDF_MB} MB.`;

/** Size shown next to a file name, e.g. "820 KB" or "5.3 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Error message for a file that can't be uploaded as a PDF, or null when it's fine to send. */
export function checkPdfFile(file: { name: string; size: number; type?: string }): string | null {
  const looksLikePdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!looksLikePdf) return "Only PDF files can be uploaded.";
  if (file.size === 0) return "This PDF is empty.";
  if (file.size > MAX_PDF_BYTES) {
    return `${PDF_TOO_LARGE_MESSAGE} This file is ${formatFileSize(file.size)}.`;
  }
  return null;
}
