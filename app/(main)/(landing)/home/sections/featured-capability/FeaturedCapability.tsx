import React from "react";
import {
  FeaturedCapabilityCardContainer,
  FeaturedCapabilityCardDescription,
  FeaturedCapabilityCardImage,
  FeaturedCapabilityCardTitle,
  FeaturedCapabilityDescription,
  FeaturedCapabilityHeading,
  FeaturedCapabilityMainContainer,
  FeaturedCapabilitySectionConatiner,
  FeaturedCapabilitySectionHeader,
  FeaturedCapabilityTitleBtn,
} from "./styled";
import Card from "@/assets/images/FeatureCard.png";
import Card2 from "@/assets/images/FeatureCard2.png";
import Card3 from "@/assets/images/FeatureCard3.png";
import Card4 from "@/assets/images/FeatureCard4.png";

export const FeaturedCapability = () => {
  return (
    <FeaturedCapabilityMainContainer>
      <FeaturedCapabilitySectionHeader>
        <FeaturedCapabilityTitleBtn>
          Featured Capability
        </FeaturedCapabilityTitleBtn>
        <FeaturedCapabilityHeading>
          Increase Sales with AI Agents
        </FeaturedCapabilityHeading>
        <FeaturedCapabilityDescription>
          Turn every visitor into a potential customer with an AI sales agent
          that engages instantly. Recommend products, answer questions, qualify
          leads, and guide customers to checkout—all through natural,
          personalized conversations.
        </FeaturedCapabilityDescription>
      </FeaturedCapabilitySectionHeader>
      <FeaturedCapabilitySectionConatiner>
        <FeaturedCapabilityCardImage
          src={Card}
          width={1000}
          height={1000}
          alt="Card image"
        />
        <FeaturedCapabilityCardContainer>
          <FeaturedCapabilityCardTitle>
            Smart Recommendations
          </FeaturedCapabilityCardTitle>
          <FeaturedCapabilityCardDescription>
            Recommend the right products based on customer needs to increase
            engagement and sales.
          </FeaturedCapabilityCardDescription>
        </FeaturedCapabilityCardContainer>
        <FeaturedCapabilityCardImage
          src={Card2}
          width={1000}
          height={1000}
          alt="Card image"
        />
        <FeaturedCapabilityCardContainer>
          <FeaturedCapabilityCardTitle>
            Instant Support
          </FeaturedCapabilityCardTitle>
          <FeaturedCapabilityCardDescription>
            Answer customer questions in real time and provide a smooth buying
            experience.
          </FeaturedCapabilityCardDescription>
        </FeaturedCapabilityCardContainer>
        <FeaturedCapabilityCardContainer>
          <FeaturedCapabilityCardTitle>
            Lead Capture
          </FeaturedCapabilityCardTitle>
          <FeaturedCapabilityCardDescription>
            Identify interested visitors and collect qualified leads
            automatically.
          </FeaturedCapabilityCardDescription>
        </FeaturedCapabilityCardContainer>
        <FeaturedCapabilityCardImage
          src={Card3}
          width={1000}
          height={1000}
          alt="Card image"
        />
        <FeaturedCapabilityCardContainer>
          <FeaturedCapabilityCardTitle>
            Sales Growth
          </FeaturedCapabilityCardTitle>
          <FeaturedCapabilityCardDescription>
            Guide customers to checkout with personalized conversations that
            convert.
          </FeaturedCapabilityCardDescription>
        </FeaturedCapabilityCardContainer>
        <FeaturedCapabilityCardImage
          src={Card4}
          width={1000}
          height={1000}
          alt="Card image"
        />
      </FeaturedCapabilitySectionConatiner>
    </FeaturedCapabilityMainContainer>
  );
};
