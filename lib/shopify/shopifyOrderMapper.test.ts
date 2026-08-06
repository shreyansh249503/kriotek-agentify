import {
  mapShopifyOrderToJourney,
  RawShopifyOrderNode,
} from "./shopifyOrderMapper";

describe("shopifyOrderMapper", () => {
  const baseOrderNode: RawShopifyOrderNode = {
    id: "gid://shopify/Order/1001",
    name: "#1001",
    email: "customer@example.com",
    createdAt: "2026-01-15T10:30:00Z",
    displayFinancialStatus: "PAID",
    displayFulfillmentStatus: "FULFILLED",
    totalPriceSet: {
      presentmentMoney: {
        amount: "149.99",
        currencyCode: "USD",
      },
    },
    customer: {
      firstName: "Jane",
      lastName: "Doe",
      email: "customer@example.com",
    },
    shippingAddress: {
      address1: "123 Main St",
      city: "New York",
      province: "NY",
      country: "USA",
      zip: "10001",
    },
    lineItems: {
      edges: [
        {
          node: {
            title: "Wireless Headphones",
            quantity: 1,
            originalUnitPriceSet: {
              presentmentMoney: {
                amount: "149.99",
                currencyCode: "USD",
              },
            },
            image: {
              url: "https://example.com/headphones.jpg",
              altText: "Wireless Headphones",
            },
          },
        },
      ],
    },
    fulfillments: [
      {
        updatedAt: "2026-01-16T12:00:00Z",
        trackingInfo: [
          {
            company: "FedEx",
            number: "FX123456789",
            url: "https://fedex.com/track/FX123456789",
          },
        ],
      },
    ],
  };

  it("should correctly map a complete paid and fulfilled Shopify order", () => {
    const result = mapShopifyOrderToJourney(baseOrderNode);

    expect(result.orderId).toBe("gid://shopify/Order/1001");
    expect(result.orderNumber).toBe("#1001");
    expect(result.customerName).toBe("Jane Doe");
    expect(result.email).toBe("customer@example.com");
    expect(result.totalPrice).toBe("149.99");
    expect(result.currency).toBe("USD");
    expect(result.statusBadge).toBe("In Transit");
    expect(result.currentStep).toBe(4);
    expect(result.isCancelled).toBe(false);
    expect(result.shippingAddress).toBe("123 Main St, New York, NY, USA, 10001");

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      name: "Wireless Headphones",
      quantity: 1,
      price: "149.99",
      currency: "USD",
      image: "https://example.com/headphones.jpg",
    });

    expect(result.tracking).toEqual({
      company: "FedEx",
      number: "FX123456789",
      url: "https://fedex.com/track/FX123456789",
    });

    expect(result.milestones).toHaveLength(5);
    expect(result.milestones[0].status).toBe("completed");
    expect(result.milestones[1].status).toBe("completed");
    expect(result.milestones[2].status).toBe("completed");
    expect(result.milestones[3].status).toBe("current");
    expect(result.milestones[4].status).toBe("upcoming");
  });

  it("should handle DELIVERED order status correctly", () => {
    const deliveredOrder: RawShopifyOrderNode = {
      ...baseOrderNode,
      displayFulfillmentStatus: "DELIVERED",
    };

    const result = mapShopifyOrderToJourney(deliveredOrder);

    expect(result.statusBadge).toBe("Delivered");
    expect(result.currentStep).toBe(5);
    expect(result.milestones[4].status).toBe("completed");
  });

  it("should handle PAID but UNFULFILLED order status (Processing)", () => {
    const pendingFulfillmentOrder: RawShopifyOrderNode = {
      ...baseOrderNode,
      displayFulfillmentStatus: "UNFULFILLED",
      fulfillments: [],
    };

    const result = mapShopifyOrderToJourney(pendingFulfillmentOrder);

    expect(result.statusBadge).toBe("Processing");
    expect(result.currentStep).toBe(3);
    expect(result.milestones[1].status).toBe("completed");
    expect(result.milestones[2].status).toBe("current");
  });

  it("should handle PENDING payment and UNFULFILLED order (Confirmed)", () => {
    const pendingOrder: RawShopifyOrderNode = {
      ...baseOrderNode,
      displayFinancialStatus: "PENDING",
      displayFulfillmentStatus: "UNFULFILLED",
      fulfillments: [],
    };

    const result = mapShopifyOrderToJourney(pendingOrder);

    expect(result.statusBadge).toBe("Confirmed");
    expect(result.currentStep).toBe(2);
    expect(result.milestones[1].status).toBe("current");
  });

  it("should correctly handle CANCELLED order", () => {
    const cancelledOrder: RawShopifyOrderNode = {
      ...baseOrderNode,
      cancelledAt: "2026-01-16T08:00:00Z",
      cancelReason: "Customer requested cancellation",
    };

    const result = mapShopifyOrderToJourney(cancelledOrder);

    expect(result.isCancelled).toBe(true);
    expect(result.cancelReason).toBe("Customer requested cancellation");
    expect(result.statusBadge).toBe("Cancelled");
    expect(result.currentStep).toBe(1);
    expect(result.milestones[1].status).toBe("error");
    expect(result.milestones[1].title).toBe("Order Cancelled");
    expect(result.milestones[1].description).toContain("Customer requested cancellation");
  });

  it("should fallback to successfulFulfillments if fulfillments is missing", () => {
    const orderWithSuccessfulFulfillments: RawShopifyOrderNode = {
      ...baseOrderNode,
      fulfillments: undefined,
      successfulFulfillments: [
        {
          updatedAt: "2026-01-16T12:00:00Z",
          trackingInfo: [
            {
              company: "DHL",
              number: "DHL987654",
              url: "https://dhl.com/track/DHL987654",
            },
          ],
        },
      ],
    };

    const result = mapShopifyOrderToJourney(orderWithSuccessfulFulfillments);

    expect(result.tracking).toEqual({
      company: "DHL",
      number: "DHL987654",
      url: "https://dhl.com/track/DHL987654",
    });
  });

  it("should resolve customer email fallback when order email is missing", () => {
    const orderWithoutDirectEmail: RawShopifyOrderNode = {
      ...baseOrderNode,
      email: undefined,
      customer: {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
      },
    };

    const result = mapShopifyOrderToJourney(orderWithoutDirectEmail);
    expect(result.email).toBe("john.smith@example.com");
  });

  it("should handle cancelled order without a cancelReason", () => {
    const cancelledOrderNoReason: RawShopifyOrderNode = {
      ...baseOrderNode,
      cancelledAt: "2026-01-16T08:00:00Z",
      cancelReason: undefined,
    };

    const result = mapShopifyOrderToJourney(cancelledOrderNoReason);
    expect(result.milestones[1].description).toBe("This order was cancelled.");
  });

  it("should handle in-transit fulfillment without tracking company", () => {
    const inTransitNoCompany: RawShopifyOrderNode = {
      ...baseOrderNode,
      displayFulfillmentStatus: "PARTIALLY_FULFILLED",
      fulfillments: [],
    };

    const result = mapShopifyOrderToJourney(inTransitNoCompany);
    expect(result.milestones[3].description).toBe("Package handed over to delivery carrier.");
  });

  it("should handle missing line items and default prices gracefully", () => {
    const minimalOrder: RawShopifyOrderNode = {
      id: "gid://shopify/Order/9999",
      name: "#9999",
      createdAt: "2026-01-01T00:00:00Z",
    };

    const result = mapShopifyOrderToJourney(minimalOrder);

    expect(result.orderId).toBe("gid://shopify/Order/9999");
    expect(result.totalPrice).toBe("0.00");
    expect(result.currency).toBe("USD");
    expect(result.items).toEqual([]);
    expect(result.customerName).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.shippingAddress).toBeNull();
    expect(result.tracking).toBeNull();
  });

  it("should fallback cleanly when invalid date string is provided", () => {
    const invalidDateOrder: RawShopifyOrderNode = {
      ...baseOrderNode,
      createdAt: "invalid-date-string",
    };

    const result = mapShopifyOrderToJourney(invalidDateOrder);
    expect(result.orderDate).toBe("Invalid Date");
  });
});
