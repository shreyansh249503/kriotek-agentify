export interface OrderJourneyMilestone {
  step: number;
  title: string;
  description: string;
  date?: string;
  status: "completed" | "current" | "upcoming" | "error";
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  currency: string;
  image?: string | null;
}

export interface TrackingInfo {
  company?: string | null;
  number?: string | null;
  url?: string | null;
}

export interface OrderJourneyData {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  email?: string;
  currentStep: number; // 1 to 5
  statusBadge: string;
  statusDescription: string;
  totalPrice: string;
  currency: string;
  milestones: OrderJourneyMilestone[];
  items: OrderItem[];
  tracking?: TrackingInfo | null;
  shippingAddress?: string | null;
  isCancelled?: boolean;
  cancelReason?: string | null;
}

export interface RawShopifyOrderNode {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  displayFinancialStatus?: string | null;
  displayFulfillmentStatus?: string | null;
  totalPriceSet?: {
    presentmentMoney?: {
      amount: string;
      currencyCode: string;
    };
  };
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  shippingAddress?: {
    city?: string | null;
    province?: string | null;
    country?: string | null;
    zip?: string | null;
    address1?: string | null;
    phone?: string | null;
  } | null;
  lineItems?: {
    edges?: Array<{
      node: {
        title: string;
        quantity: number;
        originalUnitPriceSet?: {
          presentmentMoney?: {
            amount: string;
            currencyCode: string;
          };
        };
        image?: {
          url: string;
          altText?: string | null;
        } | null;
      };
    }>;
  };
  fulfillments?: Array<{
    updatedAt?: string;
    trackingInfo?: Array<{
      number?: string | null;
      url?: string | null;
      company?: string | null;
    }>;
  }>;
  successfulFulfillments?: Array<{
    updatedAt?: string;
    trackingInfo?: Array<{
      number?: string | null;
      url?: string | null;
      company?: string | null;
    }>;
  }>;
}

export function mapShopifyOrderToJourney(order: RawShopifyOrderNode): OrderJourneyData {
  const orderDateFormatted = formatDate(order.createdAt);
  const financialStatus = (order.displayFinancialStatus || "PENDING").toUpperCase();
  const fulfillmentStatus = (order.displayFulfillmentStatus || "UNFULFILLED").toUpperCase();
  const isCancelled = Boolean(order.cancelledAt);

  // Extract items
  const items: OrderItem[] = (order.lineItems?.edges || []).map((edge) => {
    const node = edge.node;
    return {
      name: node.title,
      quantity: node.quantity,
      price: node.originalUnitPriceSet?.presentmentMoney?.amount ?? "0.00",
      currency: node.originalUnitPriceSet?.presentmentMoney?.currencyCode ?? "USD",
      image: node.image?.url ?? null,
    };
  });

  // Extract tracking info
  let tracking: TrackingInfo | null = null;
  const fulfillmentList = order.fulfillments || order.successfulFulfillments || [];
  if (fulfillmentList.length > 0) {
    const firstFulfillment = fulfillmentList[0];
    if (firstFulfillment.trackingInfo && firstFulfillment.trackingInfo.length > 0) {
      const track = firstFulfillment.trackingInfo[0];
      tracking = {
        company: track.company ?? null,
        number: track.number ?? null,
        url: track.url ?? null,
      };
    }
  }

  // Determine financial completion
  const isPaid = ["PAID", "AUTHORIZED", "PARTIALLY_REFUNDED"].includes(financialStatus);
  const isFulfilled = ["FULFILLED", "DELIVERED"].includes(fulfillmentStatus);
  const isInTransit = isFulfilled || fulfillmentStatus === "PARTIALLY_FULFILLED" || Boolean(tracking?.number);
  const isDelivered = fulfillmentStatus === "DELIVERED";

  // Calculate current step (1 to 5)
  let currentStep = 1;
  if (isCancelled) {
    currentStep = 1;
  } else if (isDelivered) {
    currentStep = 5;
  } else if (isInTransit) {
    currentStep = 4;
  } else if (isPaid) {
    currentStep = 3; // Processing
  } else {
    currentStep = 2; // Payment Pending
  }

  // Build milestones
  const milestones: OrderJourneyMilestone[] = [
    {
      step: 1,
      title: "Order Placed",
      description: "Order received and confirmed.",
      date: orderDateFormatted,
      status: "completed",
    },
    {
      step: 2,
      title: "Payment Verified",
      description: isPaid
        ? "Payment successfully processed."
        : isCancelled
        ? "Order cancelled."
        : "Awaiting payment verification.",
      status: isPaid ? "completed" : currentStep === 2 ? "current" : "upcoming",
    },
    {
      step: 3,
      title: "Preparing Order",
      description: isFulfilled || isInTransit
        ? "Order packed and ready for carrier dispatch."
        : isPaid
        ? "Store is preparing your items for shipping."
        : "Pending payment.",
      status: (isFulfilled || isInTransit) ? "completed" : currentStep === 3 ? "current" : "upcoming",
    },
    {
      step: 4,
      title: "In Transit",
      description: isDelivered
        ? "Package reached destination."
        : tracking?.company
        ? `Shipped via ${tracking.company}. Tracking: ${tracking.number || "Available"}`
        : isInTransit
        ? "Package handed over to delivery carrier."
        : "Awaiting carrier pickup.",
      status: isDelivered ? "completed" : currentStep === 4 ? "current" : "upcoming",
    },
    {
      step: 5,
      title: "Delivered",
      description: isDelivered
        ? "Order successfully delivered to destination address."
        : "Estimated delivery upon carrier dispatch.",
      status: isDelivered ? "completed" : "upcoming",
    },
  ];

  if (isCancelled) {
    milestones[1] = {
      step: 2,
      title: "Order Cancelled",
      description: order.cancelReason
        ? `Cancelled: ${order.cancelReason}`
        : "This order was cancelled.",
      date: order.cancelledAt ? formatDate(order.cancelledAt) : undefined,
      status: "error",
    };
  }

  // Address
  const addr = order.shippingAddress;
  const shippingAddressStr = addr
    ? [addr.address1, addr.city, addr.province, addr.country, addr.zip]
        .filter(Boolean)
        .join(", ")
    : null;

  // Status Badge & Description
  let statusBadge = "Confirmed";
  let statusDescription = `Order ${order.name} placed on ${orderDateFormatted}.`;

  if (isCancelled) {
    statusBadge = "Cancelled";
    statusDescription = `Order ${order.name} has been cancelled.`;
  } else if (isDelivered) {
    statusBadge = "Delivered";
    statusDescription = `Order ${order.name} has been delivered.`;
  } else if (isInTransit) {
    statusBadge = "In Transit";
    statusDescription = `Order ${order.name} is on the way.`;
  } else if (isPaid) {
    statusBadge = "Processing";
    statusDescription = `Order ${order.name} is being packed and prepared.`;
  }

  const customerName = order.customer
    ? `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim()
    : undefined;

  const resolvedEmail = order.email || order.customer?.email || undefined;

  return {
    orderId: order.id,
    orderNumber: order.name,
    orderDate: orderDateFormatted,
    customerName: customerName || undefined,
    email: resolvedEmail,
    currentStep,
    statusBadge,
    statusDescription,
    totalPrice: order.totalPriceSet?.presentmentMoney?.amount ?? "0.00",
    currency: order.totalPriceSet?.presentmentMoney?.currencyCode ?? "USD",
    milestones,
    items,
    tracking,
    shippingAddress: shippingAddressStr,
    isCancelled,
    cancelReason: order.cancelReason ?? null,
  };
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
