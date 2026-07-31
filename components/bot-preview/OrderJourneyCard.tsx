import React from "react";
import styled from "styled-components";
import type { OrderJourneyData } from "@/lib/shopify/shopifyOrderMapper";

const Container = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  margin: 12px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  width: 100%;
  text-align: left;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  gap: 8px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #111827;
`;

const Subtitle = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 500;
`;

const Badge = styled.span<{ $color: string; $bg: string; $border: string }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  white-space: nowrap;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 16px 0;
  position: relative;
  padding: 0 4px;
`;

const StepCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  flex: 0 0 auto;
`;

const Dot = styled.div<{ $state: "completed" | "current" | "upcoming" | "error" }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;

  ${({ $state }) => {
    switch ($state) {
      case "completed":
        return `background: #10b981; color: #ffffff; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);`;
      case "current":
        return `background: #2563eb; color: #ffffff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);`;
      case "error":
        return `background: #ef4444; color: #ffffff;`;
      default:
        return `background: #f3f4f6; color: #9ca3af; border: 1.5px solid #d1d5db;`;
    }
  }}
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 11px;
  color: ${({ $active }) => ($active ? "#111827" : "#6b7280")};
  margin-top: 6px;
  font-weight: ${({ $active }) => ($active ? "700" : "600")};
  text-align: center;
`;

const Line = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 3px;
  background: ${({ $active }) => ($active ? "#10b981" : "#e5e7eb")};
  margin: 0 4px 20px 4px;
  border-radius: 2px;
`;

const StatusBox = styled.div`
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 12px;
  border: 1px solid #f3f4f6;
`;

const StatusDesc = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  font-weight: 500;
`;

const Address = styled.div`
  font-size: 12px;
  color: #4b5563;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TrackingBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 9px 16px;
  background: #111827;
  color: #ffffff !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;

  &:hover {
    background: #1f2937;
  }
`;

const ItemsSection = styled.div`
  margin-top: 16px;
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
`;

const ItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ItemsTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalBadge = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #111827;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f9fafb;
`;

const ItemImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemQty = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
`;

const ItemSubtotal = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: right;
  flex-shrink: 0;
`;

const OrderTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
`;

interface OrderJourneyCardProps {
  data: OrderJourneyData;
}

export const OrderJourneyCard: React.FC<OrderJourneyCardProps> = ({ data }) => {
  if (!data || !data.orderNumber) return null;

  const items = data.items || [];
  const tracking = data.tracking;

  let badgeColor = "#10B981";
  let badgeBg = "#ECFDF5";
  let badgeBorder = "#A7F3D0";
  if (data.isCancelled) {
    badgeColor = "#EF4444";
    badgeBg = "#FEF2F2";
    badgeBorder = "#FCA5A5";
  } else if (data.currentStep === 4) {
    badgeColor = "#2563EB";
    badgeBg = "#EFF6FF";
    badgeBorder = "#BFDBFE";
  } else if (data.currentStep < 4) {
    badgeColor = "#D97706";
    badgeBg = "#FFFBEB";
    badgeBorder = "#FDE68A";
  }

  const labels = ["Placed", "Paid", "Packed", "Shipped", "Delivered"];

  return (
    <Container>
      <Header>
        <div>
          <Title>Order {data.orderNumber}</Title>
          <Subtitle>
            {data.orderDate ? `Placed on ${data.orderDate}` : ""}
            {data.email ? ` • ${data.email}` : ""}
          </Subtitle>
        </div>
        <Badge $color={badgeColor} $bg={badgeBg} $border={badgeBorder}>
          {data.statusBadge || "Active"}
        </Badge>
      </Header>

      <Stepper>
        {[1, 2, 3, 4, 5].map((i) => {
          const isCompleted = i < data.currentStep || (i === 5 && data.currentStep === 5);
          const isCurrent = i === data.currentStep && data.currentStep !== 5 && !data.isCancelled;
          const isError = Boolean(data.isCancelled && i === data.currentStep);

          let state: "completed" | "current" | "upcoming" | "error" = "upcoming";
          if (isCompleted) state = "completed";
          if (isCurrent) state = "current";
          if (isError) state = "error";

          return (
            <React.Fragment key={i}>
              <StepCol>
                <Dot $state={state}>
                  {isCompleted ? "✓" : isError ? "✕" : i}
                </Dot>
                <StepLabel $active={isCompleted || isCurrent}>{labels[i - 1]}</StepLabel>
              </StepCol>
              {i < 5 && <Line $active={i < data.currentStep} />}
            </React.Fragment>
          );
        })}
      </Stepper>

      <StatusBox>
        <StatusDesc>{data.statusDescription}</StatusDesc>
        {data.shippingAddress && (
          <Address>
            📍 <strong>Deliver to:</strong> {data.shippingAddress}
          </Address>
        )}
      </StatusBox>

      {tracking && (tracking.url || tracking.number) && (
        <TrackingBtn href={tracking.url || "#"} target="_blank" rel="noopener noreferrer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Track Package ({tracking.company || "Carrier"}{tracking.number ? ` #${tracking.number}` : ""})
        </TrackingBtn>
      )}

      {items.length > 0 && (
        <ItemsSection>
          <ItemsHeader>
            <ItemsTitle>Items in Order ({items.length})</ItemsTitle>
            {data.totalPrice && (
              <TotalBadge>
                Total: {data.currency || "$"} {data.totalPrice}
              </TotalBadge>
            )}
          </ItemsHeader>
          <ItemsList>
            {items.map((item, idx) => {
              const itemSubtotal = item.price ? (parseFloat(item.price) * item.quantity).toFixed(2) : null;
              return (
                <ItemRow key={idx}>
                  <ItemImg
                    src={
                      item.image ||
                      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect width='44' height='44' fill='%23eee'/%3E%3C/svg%3E"
                    }
                    alt={item.name}
                  />
                  <ItemDetails>
                    <ItemName>{item.name}</ItemName>
                    <ItemQty>
                      Qty: {item.quantity} × {item.currency || "$"} {item.price}
                    </ItemQty>
                  </ItemDetails>
                  {itemSubtotal && (
                    <ItemSubtotal>
                      {item.currency || "$"}{itemSubtotal}
                    </ItemSubtotal>
                  )}
                </ItemRow>
              );
            })}
          </ItemsList>
        </ItemsSection>
      )}

      {data.totalPrice && (
        <OrderTotalRow>
          <span>Order Total</span>
          <span>
            {data.currency || "$"} {data.totalPrice}
          </span>
        </OrderTotalRow>
      )}
    </Container>
  );
};
