"use client";

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
import {
  Lightning,
  Palette,
  Books,
  ChartBar,
  ChatsCircle,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function AdminHome() {
  return (
    <>
      <Header />
      <ScrollToTop />
      <HeroSection>
        <HeroContent>
          <MainHeading>
            Build Intelligent
            <br />
            AI Agents
          </MainHeading>
          <SubHeading>
            Create powerful, customizable AI chatbots that understand your
            business and engage your customers 24/7. No coding required.
          </SubHeading>
          <CTAContainer>
            <PrimaryButton href="/signup">Get Started Free</PrimaryButton>
            <SecondaryButton href="#demo">Watch Demo</SecondaryButton>
          </CTAContainer>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <SectionContainer>
          <SectionTitle>Powerful Features</SectionTitle>
          <SectionSubtitle>
            Everything you need to build and deploy intelligent AI agents that
            scale with your business.
          </SectionSubtitle>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <Lightning weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Easy Integration</FeatureTitle>
              <FeatureDescription>
                Integrate your AI agent into any platform with simple embed
                codes. Works with websites, apps, and messaging platforms.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <Palette weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Customizable Responses</FeatureTitle>
              <FeatureDescription>
                Train your agent with your own knowledge base. Fine-tune
                responses to match your brand voice and personality.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <Books weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Knowledge Base</FeatureTitle>
              <FeatureDescription>
                Upload documents, websites, and FAQs to build a comprehensive
                knowledge base your agent can reference instantly.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <ChartBar weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Real-time Analytics</FeatureTitle>
              <FeatureDescription>
                Track conversations, user satisfaction, and performance metrics
                in real-time with detailed dashboards and insights.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <ChatsCircle weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Multi-channel Support</FeatureTitle>
              <FeatureDescription>
                Deploy your agent across web, mobile, Slack, Discord, and more
                from a single unified dashboard.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <ShieldCheck weight="duotone" />
              </FeatureIcon>
              <FeatureTitle>Secure & Scalable</FeatureTitle>
              <FeatureDescription>
                Enterprise-grade security with data encryption, role-based
                access, and unlimited scalability for growing teams.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>

      <BenefitsSection>
        <SectionContainer>
          <SectionTitle>How It Works</SectionTitle>
          <SectionSubtitle>
            Get your AI agent up and running in just a few simple steps.
          </SectionSubtitle>

          <BenefitsList>
            <BenefitItem>
              <BenefitNumber>01</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Create Your Agent</BenefitTitle>
                <BenefitDescription>
                  Sign up and create a new AI agent in seconds. Choose a name
                  and configure basic settings to match your specific needs.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <BenefitNumber>02</BenefitNumber>
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
              <BenefitNumber>03</BenefitNumber>
              <BenefitContent>
                <BenefitTitle>Customize & Train</BenefitTitle>
                <BenefitDescription>
                  Fine-tune your agent&apos;s personality, response style, and
                  behavior. Test conversations to ensure it meets your high
                  standards.
                </BenefitDescription>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <BenefitNumber>04</BenefitNumber>
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

      <FinalCTA>
        <CTATitle>Ready to Transform Your Experience?</CTATitle>
        <CTADescription>
          Join thousands of businesses using Agentify to automate support and
          engage customers intelligently.
        </CTADescription>
        <PrimaryButton href="/signup">Start Building Now</PrimaryButton>
      </FinalCTA>
    </>
  );
}
