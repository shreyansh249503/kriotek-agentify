import { Header, ScrollToTop } from "@/components";
import {
  HeroSection,
  HeroContent,
  MainHeading,
  SubHeading,
  CTAContainer,
  PrimaryButton,
  SecondaryButton,
  FeaturesSection,
  SectionContainer,
  SectionTitle,
  SectionSubtitle,
  FeaturesGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  BenefitsSection,
  BenefitsList,
  BenefitItem,
  BenefitNumber,
  BenefitContent,
  BenefitTitle,
  BenefitDescription,
  FinalCTA,
  CTATitle,
  CTADescription,
} from "./styled";

export default async function AdminHome() {
  return (
    <>
      <Header />
      <ScrollToTop />

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <MainHeading>Build Intelligent AI Agents</MainHeading>
          <SubHeading>
            Create powerful, customizable AI chatbots that understand your
            business and engage your customers 24/7
          </SubHeading>
          <CTAContainer>
            <PrimaryButton>Get Started Free</PrimaryButton>
            <SecondaryButton>Watch Demo</SecondaryButton>
          </CTAContainer>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionContainer>
          <SectionTitle>Powerful Features</SectionTitle>
          <SectionSubtitle>
            Everything you need to build and deploy intelligent AI agents
          </SectionSubtitle>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Easy Integration</FeatureTitle>
              <FeatureDescription>
                Integrate your AI agent into any platform with simple embed
                codes. Works with websites, apps, and messaging platforms.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🎨</FeatureIcon>
              <FeatureTitle>Customizable Responses</FeatureTitle>
              <FeatureDescription>
                Train your agent with your own knowledge base. Fine-tune
                responses to match your brand voice and personality.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📚</FeatureIcon>
              <FeatureTitle>Knowledge Base Management</FeatureTitle>
              <FeatureDescription>
                Upload documents, websites, and FAQs to build a comprehensive
                knowledge base your agent can reference.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Real-time Analytics</FeatureTitle>
              <FeatureDescription>
                Track conversations, user satisfaction, and performance metrics
                in real-time with detailed dashboards.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>💬</FeatureIcon>
              <FeatureTitle>Multi-channel Support</FeatureTitle>
              <FeatureDescription>
                Deploy your agent across web, mobile, Slack, Discord, and more
                from a single dashboard.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>Secure & Scalable</FeatureTitle>
              <FeatureDescription>
                Enterprise-grade security with data encryption, role-based
                access, and unlimited scalability.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>

      {/* Benefits Section - How It Works */}
      <BenefitsSection>
        <SectionContainer>
          <SectionTitle>How It Works</SectionTitle>
          <SectionSubtitle>
            Get your AI agent up and running in just a few simple steps
          </SectionSubtitle>

          <BenefitsList>
            <BenefitItem>
              <BenefitNumber>1</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Create Your Agent</BenefitTitle>
                <BenefitDescription>
                  Sign up and create a new AI agent in seconds. Choose a name
                  and configure basic settings to match your needs.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <BenefitNumber>2</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Add Your Knowledge</BenefitTitle>
                <BenefitDescription>
                  Upload documents, paste text, or connect your website. Your
                  agent will learn from your content to provide accurate
                  responses.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <BenefitNumber>3</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Customize & Train</BenefitTitle>
                <BenefitDescription>
                  Fine-tune your agent&apos;s personality, response style, and
                  behavior. Test conversations to ensure it meets your
                  standards.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <BenefitNumber>4</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Deploy Anywhere</BenefitTitle>
                <BenefitDescription>
                  Copy the embed code and add your AI agent to your website,
                  app, or messaging platform. Start engaging users instantly.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>
          </BenefitsList>
        </SectionContainer>
      </BenefitsSection>

      {/* Final CTA */}
      <FinalCTA>
        <CTATitle>Ready to Transform Your Customer Experience?</CTATitle>
        <CTADescription>
          Join thousands of businesses using Agentify to automate support and
          engage customers intelligently
        </CTADescription>
        <PrimaryButton>Start Building Now</PrimaryButton>
      </FinalCTA>
    </>
  );
}
