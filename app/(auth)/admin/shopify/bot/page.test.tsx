import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BotConfigPage from "./page";
import { BotConfig } from "./type";
import { BannerState } from "./useBotConfig";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUpdate = jest.fn();
const mockHandleSave = jest.fn();
const mockSetBanner = jest.fn();
const mockHandleLogoUpload = jest.fn();

let mockUseBotConfigReturn = {
  config: {
    id: "bot-123",
    public_key: "pk_shopify_test",
    name: "Shopify Assistant",
    description: "Helps shopify buyers",
    tone: "friendly",
    primary_color: "6C47FF",
    logo_url: "https://example.com/logo.png",
    contact_enabled: true,
    contact_email: "support@example.com",
    contact_prompt: "May I have your email?",
    ecommerce_enabled: true,
    ecommerce_prompt: "Check out our bestseller!",
  } as BotConfig | null,
  loading: false,
  unauthorized: false,
  saving: false,
  banner: null as BannerState | null,
  setBanner: mockSetBanner,
  update: mockUpdate,
  handleSave: mockHandleSave,
};

jest.mock("./useBotConfig", () => ({
  useBotConfig: () => mockUseBotConfigReturn,
}));

jest.mock("./useLogoUpload", () => ({
  useLogoUpload: () => ({
    uploadingLogo: false,
    handleLogoUpload: mockHandleLogoUpload,
  }),
}));

jest.mock("@/components", () => ({
  BotPreview: (props: { name?: string }) => (
    <div data-testid="bot-preview">
      <span>BotPreview: {props.name}</span>
    </div>
  ),
}));

jest.mock("@shopify/polaris", () => ({
  Page: ({
    children,
    title,
    primaryAction,
    backAction,
  }: {
    children?: React.ReactNode;
    title?: React.ReactNode;
    primaryAction?: { content?: React.ReactNode; onAction?: () => void };
    backAction?: { content?: React.ReactNode; onAction?: () => void };
  }) => (
    <div data-testid="polaris-page">
      <h1>{title}</h1>
      {primaryAction && (
        <button onClick={primaryAction.onAction}>{primaryAction.content}</button>
      )}
      {backAction && (
        <button onClick={backAction.onAction}>{backAction.content}</button>
      )}
      {children}
    </div>
  ),
  Layout: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    {
      Section: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    }
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  FormLayout: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  TextField: ({
    label,
    value,
    onChange,
  }: {
    label?: React.ReactNode;
    value?: string;
    onChange?: (val: string) => void;
  }) => (
    <label>
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </label>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label?: React.ReactNode;
    value?: string;
    onChange?: (val: string) => void;
    options?: Array<{ label: string; value: string }>;
  }) => (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange && onChange(e.target.value)}>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  ),
  Checkbox: ({
    label,
    checked,
    onChange,
  }: {
    label?: React.ReactNode;
    checked?: boolean;
    onChange?: (val: boolean) => void;
  }) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      {label}
    </label>
  ),
  Banner: ({ children, title }: { children?: React.ReactNode; title?: string }) => (
    <div>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
  BlockStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  InlineStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner">Spinner</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Button: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropZone: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    {
      FileUpload: () => <div>DropZone</div>,
    }
  ),
  Thumbnail: ({ source, alt }: { source?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={source} alt={alt} />
  ),
}));

describe("Shopify BotConfigPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show spinner while loading bot config", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: true,
      unauthorized: false,
      config: null,
    };

    render(<BotConfigPage />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should render unauthorized banner when unauthorized is true", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: false,
      unauthorized: true,
      config: null,
    };

    render(<BotConfigPage />);
    expect(screen.getByText("Shopify App Bridge Required")).toBeInTheDocument();
  });

  it("should render no bot banner when config is null", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: false,
      unauthorized: false,
      config: null,
    };

    render(<BotConfigPage />);
    expect(screen.getByText("No bot found")).toBeInTheDocument();
  });

  it("should render bot form fields and live BotPreview when config is loaded", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: false,
      unauthorized: false,
      config: {
        id: "bot-123",
        public_key: "pk_shopify_test",
        name: "Shopify Assistant",
        description: "Helps shopify buyers",
        tone: "friendly",
        primary_color: "6C47FF",
        logo_url: "https://example.com/logo.png",
        contact_enabled: true,
        contact_email: "support@example.com",
        contact_prompt: "May I have your email?",
        ecommerce_enabled: true,
        ecommerce_prompt: "Check out our bestseller!",
      },
    };

    render(<BotConfigPage />);

    expect(screen.getByDisplayValue("pk_shopify_test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Shopify Assistant")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Helps shopify buyers")).toBeInTheDocument();
    expect(screen.getByDisplayValue("support@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("bot-preview")).toBeInTheDocument();
  });

  it("should handle Save button click", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: false,
      unauthorized: false,
      config: {
        id: "bot-123",
        name: "Shopify Assistant",
        description: "Helps shopify buyers",
        tone: "friendly",
        primary_color: "6C47FF",
        contact_enabled: false,
        contact_email: "support@example.com",
        contact_prompt: "May I have your email?",
        ecommerce_enabled: false,
        ecommerce_prompt: "Check out our bestseller!",
      },
    };

    render(<BotConfigPage />);

    const saveBtn = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveBtn);

    expect(mockHandleSave).toHaveBeenCalled();
  });

  it("should handle input changes and update form fields", () => {
    mockUseBotConfigReturn = {
      ...mockUseBotConfigReturn,
      loading: false,
      unauthorized: false,
      config: {
        id: "bot-123",
        name: "Shopify Assistant",
        description: "Old description",
        tone: "friendly",
        primary_color: "6C47FF",
        contact_enabled: true,
        contact_email: "old@example.com",
        contact_prompt: "Old prompt",
        ecommerce_enabled: true,
        ecommerce_prompt: "Old sales prompt",
      },
    };

    render(<BotConfigPage />);

    const nameInput = screen.getByDisplayValue("Shopify Assistant");
    fireEvent.change(nameInput, { target: { value: "New Bot Name" } });
    expect(mockUpdate).toHaveBeenCalledWith("name", "New Bot Name");
  });
});
