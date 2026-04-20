
import { FeaturesCard } from "../../components";
import {
  FeaturesGrid,
  FeaturesSection,
  SectionContainer,
  SectionContentWrapper,
  SectionSubtitle,
  SectionTitle,
} from "./styled";

import {
  LightningIcon,
  PaletteIcon,
  BooksIcon,
  ChartBarIcon,
  ChatsCircleIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";

const features = [
  {
    icon: <LightningIcon weight="duotone" />,
    title: "Easy Integration",
    description:
      "Integrate your AI agent into any platform with simple embed codes. Works with websites, apps, and messaging platforms.",
  },
  {
    icon: <PaletteIcon weight="duotone" />,
    title: "Customizable Responses",
    description:
      "Train your agent with your own knowledge base. Fine-tune responses to match your brand voice and personality.",
  },
  {
    icon: <BooksIcon weight="duotone" />,
    title: "Knowledge Base",
    description:
      "Upload documents, websites, and FAQs to build a comprehensive knowledge base your agent can reference instantly.",
  },
  {
    icon: <ChartBarIcon weight="duotone" />,
    title: "Real-time Analytics",
    description:
      "Track conversations, user satisfaction, and performance metrics in real-time with detailed dashboards and insights.",
  },
  {
    icon: <ChatsCircleIcon weight="duotone" />,
    title: "Multi-channel Support",
    description:
      "Deploy your agent across web, mobile, Slack, Discord, and more from a single unified dashboard.",
  },
  {
    icon: <ShieldCheckIcon weight="duotone" />,
    title: "Secure & Scalable",
    description:
      "Enterprise-grade security with data encryption, role-based access, and unlimited scalability for growing teams.",
  },
];

export const Features = () => {
  return (
    <FeaturesSection id="features">
      <SectionContainer>
        <SectionContentWrapper>
          <SectionTitle>Powerful Features</SectionTitle>
          <SectionSubtitle>
            Everything you need to build and deploy intelligent AI agents that
            scale with your business.
          </SectionSubtitle>
        </SectionContentWrapper>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeaturesCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </FeaturesGrid>
      </SectionContainer>
    </FeaturesSection>
  );
};
