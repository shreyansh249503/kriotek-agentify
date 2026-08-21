"use client";

import React from "react";
import { ShieldCheck, Truck, CreditCard } from "@phosphor-icons/react";
import {
  BadgesSection as BadgesSectionContainer,
  BadgesContainer,
  BadgeCard,
  BadgeInfo,
  BadgeTitle,
  BadgeDesc,
} from "../../styled";

export const BadgesSection: React.FC = () => {
  return (
    <BadgesSectionContainer>
      <BadgesContainer>
        <BadgeCard>
          <ShieldCheck size={40} weight="light" />
          <BadgeInfo>
            <BadgeTitle>100% Secure Checkout</BadgeTitle>
            <BadgeDesc>
              Your security is our priority. Transactions are fully encrypted.
            </BadgeDesc>
          </BadgeInfo>
        </BadgeCard>

        <BadgeCard>
          <Truck size={40} weight="light" />
          <BadgeInfo>
            <BadgeTitle>Fast Delivery</BadgeTitle>
            <BadgeDesc>
              Get your products shipped and delivered quickly right to your
              doorstep.
            </BadgeDesc>
          </BadgeInfo>
        </BadgeCard>

        <BadgeCard>
          <CreditCard size={40} weight="light" />
          <BadgeInfo>
            <BadgeTitle>Easy Payments</BadgeTitle>
            <BadgeDesc>
              Supports credit cards, digital wallets, and custom invoice
              options.
            </BadgeDesc>
          </BadgeInfo>
        </BadgeCard>
      </BadgesContainer>
    </BadgesSectionContainer>
  );
};
