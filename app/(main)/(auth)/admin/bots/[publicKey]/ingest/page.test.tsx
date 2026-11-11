import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import IngestPage from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ publicKey: "pk_test" }),
}));

jest.mock("@/context/BreadcrumbContext", () => ({
  useBreadcrumb: () => ({ setBreadcrumbMeta: jest.fn() }),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: "token" } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: jest.fn().mockResolvedValue({ data: { name: "Test Bot" } }) }),
      }),
    }),
  },
}));

jest.mock("@/components", () => ({
  EmbedSuccess: () => <div>Your chatbot is ready!</div>,
  PrimaryButton: ({ children, onClick, disabled }: { children?: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

function pdfOfSize(size: number, name = "manual.pdf") {
  const file = new File(["%PDF-1.4"], name, { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function pickPdf(container: HTMLElement, file: File) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

describe("IngestPage PDF size check", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  it("shows the size limit before a file is picked", () => {
    render(<IngestPage />);
    expect(screen.getByText("PDF only, up to 4 MB")).toBeInTheDocument();
  });

  it("rejects an oversized PDF as soon as it's picked", () => {
    const { container } = render(<IngestPage />);

    pickPdf(container, pdfOfSize(5 * 1024 * 1024, "big.pdf"));

    expect(screen.getAllByText("PDF is too large. The limit is 4 MB. This file is 5.0 MB.").length).toBeGreaterThan(0);
    expect(screen.queryByText("big.pdf")).toBeNull();
    expect(screen.getByText("Choose a PDF file")).toBeInTheDocument();
  });

  it("ingests nothing when the only source is an oversized PDF", () => {
    const { container } = render(<IngestPage />);
    pickPdf(container, pdfOfSize(5 * 1024 * 1024, "big.pdf"));

    fireEvent.click(screen.getByRole("button", { name: "Ingest All Selected Sources" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Your chatbot is ready!")).toBeNull();
  });

  it("with text and a rejected PDF, ingests only the text (the PDF was never kept)", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    const { container } = render(<IngestPage />);

    fireEvent.change(screen.getByPlaceholderText("Types or paste content here..."), {
      target: { value: "Our store opens at 9am." },
    });
    pickPdf(container, pdfOfSize(5 * 1024 * 1024, "big.pdf"));
    fireEvent.click(screen.getByRole("button", { name: "Ingest All Selected Sources" }));

    await waitFor(() => expect(screen.getByText("Your chatbot is ready!")).toBeInTheDocument(), { timeout: 3000 });
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls.some((url) => url.endsWith("/api/ingest"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/api/ingest-pdf"))).toBe(false);
    expect(screen.queryByText(/PDF Upload:/)).toBeNull();
  });

  it("keeps a PDF under the limit, shows its size and uploads it", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ chunks: 4 }) });
    const { container } = render(<IngestPage />);

    pickPdf(container, pdfOfSize(700 * 1024, "faq.pdf"));
    expect(screen.getByText("faq.pdf")).toBeInTheDocument();
    expect(screen.getByText("700 KB")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Ingest All Selected Sources" }));

    await waitFor(() => expect(screen.getByText("PDF Upload: Processed into 4 chunks")).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith("/api/ingest-pdf"))).toBe(true);
  });
});
