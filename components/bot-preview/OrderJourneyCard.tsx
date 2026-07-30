import React from "react";
import styled from "styled-components";
import type { OrderJourneyData } from "@/lib/shopify/shopifyOrderMapper";

const Container = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin: 10px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #111827;
`;

const Subtitle = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const Badge = styled.span<{ $color: string; $bg: string }>`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 12px 0;
  position: relative;
`;

const StepCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
`;

const Dot = styled.div<{ $state: "completed" | "current" | "upcoming" | "error" }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;

  ${({ $state }) => {
    switch ($state) {
      case "completed":
        return `background: #10b981; color: #ffffff;`;
      case "current":
        return `background: #2563eb; color: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);`;
      case "error":
        return `background: #ef4444; color: #ffffff;`;
      default:
        return `background: #f3f4f6; color: #9ca3af; border: 1px solid #d1d5db;`;
    }
  }}
`;

const StepLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 500;
`;

const Line = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 2px;
  background: ${({ $active }) => ($active ? "#10b981" : "#e5e7eb")};
  margin: 0 2px 14px 2px;
`;

const StatusBox = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 10px;
  border: 1px solid #f3f4f6;
`;

const StatusDesc = styled.div`
  font-size: 12px;
  color: #374151;
  line-height: 1.4;
`;

const Address = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
`;

const TrackingBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #111827;
  color: #ffffff !important;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ItemsHeader = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 12px;
  margin-bottom: 6px;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
`;

const ItemImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
`;

const ItemQty = styled.div`
  font-size: 11px;
  color: #6b7280;
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
  if (data.isCancelled) {
    badgeColor = "#EF4444";
    badgeBg = "#FEF2F2";
  } else if (data.currentStep === 4) {
    badgeColor = "#2563EB";
    badgeBg = "#EFF6FF";
  } else if (data.currentStep < 4) {
    badgeColor = "#F59E0B";
    badgeBg = "#FFFBEB";
  }

  const labels = ["Placed", "Paid", "Packed", "Shipped", "Delivered"];

  return (
    <Container>
      <Header>
        <div>
          <Title>Order {data.orderNumber}</Title>
          <Subtitle>{data.orderDate}</Subtitle>
        </div>
        <Badge $color={badgeColor} $bg={badgeBg}>
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
                <StepLabel>{labels[i - 1]}</StepLabel>
              </StepCol>
              {i < 5 && <Line $active={i < data.currentStep} />}
            </React.Fragment>
          );
        })}
      </Stepper>

      <StatusBox>
        <StatusDesc>{data.statusDescription}</StatusDesc>
        {data.shippingAddress && <Address>📍 Deliver to: {data.shippingAddress}</Address>}
      </StatusBox>

      {tracking && (tracking.url || tracking.number) && (
        <TrackingBtn href={tracking.url || "#"} target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Track Package ({tracking.company || "Carrier"}{tracking.number ? ` #${tracking.number}` : ""})
        </TrackingBtn>
      )}

      {items.length > 0 && (
        <>
          <ItemsHeader>Items in Order ({items.length})</ItemsHeader>
          <ItemsList>
            {items.map((item, idx) => (
              <ItemRow key={idx}>
                <ItemImg
                  src={item.image || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23eee'/%3E%3C/svg%3E"}
                  alt={item.name}
                />
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemQty>
                    Qty: {item.quantity} × {item.currency} {item.price}
                  </ItemQty>
                </ItemDetails>
              </ItemRow>
            ))}
          </ItemsList>
        </>
      )}
    </Container>
  );
};
