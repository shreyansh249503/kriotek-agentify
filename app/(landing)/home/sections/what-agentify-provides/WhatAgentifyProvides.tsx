import { BlackButton } from "@/components";
import {
  WAPCardImage,
  WAPCardImage2,
  WAPCardImage3,
  WAPCardImage4,
  WGPCardUpperContainer,
  WGPCardUpperInnerContainer,
  WhatAgentifyProvidesCardContainer,
  WhatAgentifyProvidesDescription,
  WhatAgentifyProvidesHeading,
  WhatAgentifyProvidesTitleBtn,
  WhatAgentigyProvidesMainConatiner,
  WhatAgentigyProvidesPrimarySection,
  WhatAgentigyProvidesSecondarySection,
  WhatAgentigyProvidesSectionHeader,
  WGPCardLowerContainer,
  WGPCardTitle,
  WGPCardDescription,
  WGPCardHoverBg,
} from "./styled";
import Card1 from "@/assets/images/Card1.svg";
import Card2 from "@/assets/images/Card2.svg";
import Card3 from "@/assets/images/Card3.svg";
import Card4 from "@/assets/images/Card4.svg";

interface WhatAgentifyProvidesCardProps {
  image: React.ReactNode;
  title: string;
  description: string;
}

const WhatAgentifyProvidesCard = ({
  image,
  title,
  description,
}: WhatAgentifyProvidesCardProps) => {
  return (
    <WhatAgentifyProvidesCardContainer>
      <WGPCardHoverBg />
      <WGPCardUpperContainer>
        <WGPCardUpperInnerContainer>{image}</WGPCardUpperInnerContainer>
      </WGPCardUpperContainer>
      <WGPCardLowerContainer>
        <WGPCardTitle>{title}</WGPCardTitle>
        <WGPCardDescription>{description}</WGPCardDescription>
      </WGPCardLowerContainer>
    </WhatAgentifyProvidesCardContainer>
  );
};

export const WhatAgentifyProvides = () => {
  return (
    <WhatAgentigyProvidesMainConatiner>
      <WhatAgentigyProvidesSectionHeader>
        <WhatAgentigyProvidesPrimarySection>
          <WhatAgentifyProvidesTitleBtn>
            What Agentify Provides ?
          </WhatAgentifyProvidesTitleBtn>
          <WhatAgentifyProvidesHeading>
            Things we provide to build agents & scale your business.
          </WhatAgentifyProvidesHeading>
          <WhatAgentifyProvidesDescription>
            Build intelligent AI agents that engage visitors, capture
            high-quality leads, answer questions instantly, and automate
            repetitive conversations. Agentify gives your business the tools to
            deliver faster responses, improve customer experiences, and convert
            more visitors into customers—all from one powerful platform.
          </WhatAgentifyProvidesDescription>
          <BlackButton>Explore all features</BlackButton>
        </WhatAgentigyProvidesPrimarySection>
        <WhatAgentigyProvidesSecondarySection>
          <WhatAgentifyProvidesCard
            image={
              <WAPCardImage
                src={Card4}
                width={100}
                height={100}
                alt="AI Support"
              />
            }
            title="AI Support Agents"
            description="Engage visitors 24/7 with customized responses, resolve FAQs, and match your brand voice instantly."
          />
          <WhatAgentifyProvidesCard
            image={
              <WAPCardImage2
                src={Card3}
                width={100}
                height={100}
                alt="Lead Capture"
              />
            }
            title="Lead Capture & Ingestion"
            description="Automatically gather visitor details, qualify leads, and capture contact information on autopilot."
          />
          <WhatAgentifyProvidesCard
            image={
              <WAPCardImage3
                src={Card2}
                width={100}
                height={100}
                alt="E-Commerce Assistant"
              />
            }
            title="E-Commerce Assistant"
            description="Recommend products, share direct checkout links, and turn your chatbot into an active salesperson."
          />
          <WhatAgentifyProvidesCard
            image={
              <WAPCardImage4
                src={Card1}
                width={100}
                height={100}
                alt="Analytics"
              />
            }
            title="Real-Time Analytics"
            description="Track visitor conversations, lead counts, and chatbot performance metrics in real-time."
          />
        </WhatAgentigyProvidesSecondarySection>
      </WhatAgentigyProvidesSectionHeader>
    </WhatAgentigyProvidesMainConatiner>
  );
};
