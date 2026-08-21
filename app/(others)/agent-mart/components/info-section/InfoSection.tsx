"use client";

import React from "react";
import InfoReturn from "@/assets/images/info-Return.svg";
import InfoTruck from "@/assets/images/info-Truck.svg";
import InfoHeadphone from "@/assets/images/Info-Headphone.svg";
import InfoLock from "@/assets/images/info-Lock.svg";
import {
  InfoSection as InfoSectionContainer,
  InfoCardContainer,
  InfoCardIconContainer,
  InfoCardIcon,
  InfoCardDetailsWrapper,
  InfoCardTitle,
  InfoCardDescription,
} from "../../styled";

const INFO_CARDS = [
  {
    id: "shipping",
    icon: InfoTruck,
    title: "Free Shipping",
    description: "On shopping over $50",
  },
  {
    id: "payments",
    icon: InfoLock,
    title: "Secure Payments",
    description: "100% secure checkout",
  },
  {
    id: "return",
    icon: InfoReturn,
    title: "Easy Return",
    description: "30-days return policy",
  },
  {
    id: "support",
    icon: InfoHeadphone,
    title: "24/7 Support",
    description: "Always here to help",
  },
];

export const InfoSection: React.FC = () => {
  return (
    <InfoSectionContainer>
      {INFO_CARDS.map((info) => (
        <InfoCardContainer key={info.id}>
          <InfoCardIconContainer>
            <InfoCardIcon
              src={info.icon}
              alt={info.title}
              width={40}
              height={40}
            />
          </InfoCardIconContainer>
          <InfoCardDetailsWrapper>
            <InfoCardTitle>{info.title}</InfoCardTitle>
            <InfoCardDescription>{info.description}</InfoCardDescription>
          </InfoCardDetailsWrapper>
        </InfoCardContainer>
      ))}
    </InfoSectionContainer>
  );
};
