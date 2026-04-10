"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCardIcon, RocketIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useBilling } from "@/hooks/useBilling";
import { createCheckoutSession, createPortalSession } from "@/services/billing.api";
import { Loader } from "@/components";
import {
  BillingContainer,
  BillingWrapper,
  SectionTitle,
  CurrentPlanCard,
  PlanInfo,
  PlanName,
  PlanStatus,
  PeriodNote,
  ManageButton,
  UsageGrid,
  UsageCard,
  UsageLabel,
  UsageValue,
  UsageLimit,
  ProgressBar,
  ProgressFill,
  PlansGrid,
  PlanCard,
  CurrentBadge,
  PlanCardName,
  PlanPrice,
  PlanPriceAmount,
  PlanPricePer,
  PlanFeatures,
  PlanFeature,
  UpgradeButton,
} from "./styled";

const PLAN_DISPLAY = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    features: ["1 bot", "30 messages/day", "20 KB pages"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 29,
    features: ["3 bots", "2,000 messages/mo", "100 KB pages", "Lead capture"],
  },
  {
    id: "business",
    name: "Business",
    price: 79,
    features: ["10 bots", "10,000 messages/mo", "Unlimited KB pages", "Lead capture", "Analytics"],
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    features: [
      "Unlimited bots",
      "Unlimited messages",
      "Unlimited KB pages",
      "Lead capture",
      "Analytics",
      "Priority support",
    ],
  },
];

function formatLimit(value: number): string {
  return value === -1 ? "∞" : value.toLocaleString();
}

function usagePct(used: number, limit: number): number {
  if (limit === -1) return 0;
  return (used / limit) * 100;
}

export default function BillingPage() {
  const { data, isLoading, refetch } = useBilling();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const canceledParam = searchParams.get("canceled");

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free" || planId === data?.plan) return;
    setLoadingPlan(planId);
    try {
      const { url } = await createCheckoutSession(planId);
      window.location.href = url;
    } catch {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!data) return null;

  const currentPlanDisplay = PLAN_DISPLAY.find((p) => p.id === data.plan) ?? PLAN_DISPLAY[0];
  const periodEnd = data.period_end ? new Date(data.period_end).toLocaleDateString() : null;

  const botsPct = usagePct(data.usage.bots, data.limits.bots);
  const msgsPct = usagePct(data.usage.messages, data.limits.messages);
  const pagesPct = usagePct(data.usage.pages, data.limits.pages);

  return (
    <BillingContainer>
      <BillingWrapper>
        {successParam && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: 12,
              padding: "14px 20px",
              color: "#065f46",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircleIcon size={18} weight="fill" />
            Subscription activated! Your plan has been upgraded.
          </div>
        )}

        {canceledParam && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "14px 20px",
              color: "#92400e",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Checkout was canceled. No changes were made.
          </div>
        )}

        {/* Current plan */}
        <div>
          <SectionTitle>
            <CreditCardIcon size={16} weight="fill" />
            Current Plan
          </SectionTitle>
          <CurrentPlanCard>
            <PlanInfo>
              <PlanName>{currentPlanDisplay.name}</PlanName>
              <PlanStatus $status={data.status}>
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </PlanStatus>
              {periodEnd && <PeriodNote>Renews {periodEnd}</PeriodNote>}
            </PlanInfo>
            {data.plan !== "free" && (
              <ManageButton onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? "Loading..." : "Manage Subscription"}
              </ManageButton>
            )}
          </CurrentPlanCard>
        </div>

        {/* Usage */}
        <div>
          <SectionTitle>Usage This Period</SectionTitle>
          <UsageGrid>
            <UsageCard>
              <UsageLabel>Bots</UsageLabel>
              <UsageValue>
                {data.usage.bots}
                <UsageLimit> / {formatLimit(data.limits.bots)}</UsageLimit>
              </UsageValue>
              <ProgressBar>
                <ProgressFill $pct={botsPct} $warn={botsPct >= 80} />
              </ProgressBar>
            </UsageCard>

            <UsageCard>
              <UsageLabel>Messages {data.limits.messagesPeriod === "daily" ? "Today" : "This Month"}</UsageLabel>
              <UsageValue>
                {data.usage.messages.toLocaleString()}
                <UsageLimit> / {formatLimit(data.limits.messages)}</UsageLimit>
              </UsageValue>
              <ProgressBar>
                <ProgressFill $pct={msgsPct} $warn={msgsPct >= 80} />
              </ProgressBar>
            </UsageCard>

            <UsageCard>
              <UsageLabel>KB Pages</UsageLabel>
              <UsageValue>
                {data.usage.pages}
                <UsageLimit> / {formatLimit(data.limits.pages)}</UsageLimit>
              </UsageValue>
              <ProgressBar>
                <ProgressFill $pct={pagesPct} $warn={pagesPct >= 80} />
              </ProgressBar>
            </UsageCard>
          </UsageGrid>
        </div>

        {/* Plans */}
        <div>
          <SectionTitle>
            <RocketIcon size={16} weight="fill" />
            Plans
          </SectionTitle>
          <PlansGrid>
            {PLAN_DISPLAY.map((plan) => {
              const isCurrent = plan.id === data.plan;
              const isLoading = loadingPlan === plan.id;

              return (
                <PlanCard key={plan.id} $current={isCurrent}>
                  {isCurrent && <CurrentBadge>Current</CurrentBadge>}
                  <PlanCardName>{plan.name}</PlanCardName>
                  <PlanPrice>
                    <PlanPriceAmount>${plan.price}</PlanPriceAmount>
                    <PlanPricePer>/mo</PlanPricePer>
                  </PlanPrice>
                  <PlanFeatures>
                    {plan.features.map((f) => (
                      <PlanFeature key={f}>{f}</PlanFeature>
                    ))}
                  </PlanFeatures>
                  <UpgradeButton
                    $current={isCurrent}
                    disabled={isCurrent || !!loadingPlan}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isLoading ? "Loading..." : isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                  </UpgradeButton>
                </PlanCard>
              );
            })}
          </PlansGrid>
        </div>
      </BillingWrapper>
    </BillingContainer>
  );
}
