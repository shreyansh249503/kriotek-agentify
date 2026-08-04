import { render, screen } from "@testing-library/react";
import { OrderJourneyCard } from "./OrderJourneyCard";
import type { OrderJourneyData } from "@/lib/shopify/shopifyOrderMapper";
import React from "react";

describe("OrderJourneyCard Component", () => {
  it("should return null if data or orderNumber is missing", () => {
    const { container: container1 } = render(
      // @ts-expect-error Testing empty data
      <OrderJourneyCard data={null} />
    );
    expect(container1.firstChild).toBeNull();

    const { container: container2 } = render(
      // @ts-expect-error Testing data with missing orderNumber
      <OrderJourneyCard data={{ statusBadge: "Active" }} />
    );
    expect(container2.firstChild).toBeNull();
  });

  it("should render order header, status badge, step progress, address, tracking button, and items list", () => {
    const mockData: OrderJourneyData = {
      orderId: "gid://shopify/Order/1001",
      orderNumber: "#1001",
      orderDate: "Aug 4, 2026",
      email: "user@example.com",
      statusBadge: "Shipped",
      statusDescription: "Your order is on the way!",
      shippingAddress: "123 Main St, New York, NY",
      currentStep: 4,
      isCancelled: false,
      milestones: [],
      tracking: {
        company: "FedEx",
        number: "FX123456",
        url: "https://fedex.com/track/FX123456",
      },
      currency: "$",
      totalPrice: "99.99",
      items: [
        {
          name: "Smart Watch",
          quantity: 1,
          price: "99.99",
          currency: "$",
          image: "https://example.com/watch.png",
        },
      ],
    };

    render(<OrderJourneyCard data={mockData} />);

    expect(screen.getByText("Order #1001")).toBeInTheDocument();
    expect(screen.getByText(/Placed on Aug 4, 2026 • user@example.com/)).toBeInTheDocument();
    expect(screen.getAllByText("Shipped")[0]).toBeInTheDocument();
    expect(screen.getByText("Your order is on the way!")).toBeInTheDocument();
    expect(screen.getByText(/Deliver to:/)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, New York, NY/)).toBeInTheDocument();

    const trackingLink = screen.getByRole("link", { name: /Track Package/i });
    expect(trackingLink).toHaveAttribute("href", "https://fedex.com/track/FX123456");
    expect(trackingLink).toHaveTextContent("Track Package (FedEx #FX123456)");

    expect(screen.getByText("Smart Watch")).toBeInTheDocument();
    expect(screen.getByText("Qty: 1 × $ 99.99")).toBeInTheDocument();
    expect(screen.getByText("Total: $ 99.99")).toBeInTheDocument();
  });

  it("should render cancelled status badge styling and error step indicator when order is cancelled", () => {
    const cancelledData: OrderJourneyData = {
      orderId: "gid://shopify/Order/1002",
      orderNumber: "#1002",
      orderDate: "Aug 1, 2026",
      statusBadge: "Cancelled",
      statusDescription: "Order was cancelled by customer.",
      currentStep: 2,
      isCancelled: true,
      milestones: [],
      totalPrice: "0.00",
      currency: "$",
      items: [],
    };

    render(<OrderJourneyCard data={cancelledData} />);

    expect(screen.getByText("Order #1002")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Order was cancelled by customer.")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });
});
