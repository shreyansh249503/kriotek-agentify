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
  AnimatedBackground,
  AINode,
  AICircle,
  FloatingParticle,
  DataStream,
  GridBackground,
  NeuralLine,
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
      {/* <Header /> */}

      <HeroSection>
        <AnimatedBackground>
          <GridBackground />

          {/* <DataStream $left="5%" $delay="0s" $speed="9s" /> */}
          <DataStream $left="15%" $delay="2s" $speed="12s" />
          <DataStream $left="25%" $delay="4s" $speed="15s" />
          {/* <DataStream $left="35%" $delay="1s" $speed="10s" /> */}
          {/* <DataStream $left="55%" $delay="3s" $speed="13s" /> */}
          <DataStream $left="65%" $delay="5s" $speed="16s" />
          <DataStream $left="75%" $delay="2s" $speed="11s" />
          <DataStream $left="85%" $delay="4s" $speed="14s" />
          {/* <DataStream $left="95%" $delay="0.5s" $speed="8s" /> */}

          {/* <NeuralLine
            $top="20%"
            $left="10%"
            $width="150px"
            $rotate="25deg"
            $delay="0s"
          /> */}
          {/* <NeuralLine
            $top="60%"
            $left="80%"
            $width="180px"
            $rotate="-35deg"
            $delay="1.5s"
          /> */}
          <NeuralLine
            $top="40%"
            $left="5%"
            $width="120px"
            $rotate="15deg"
            $delay="2s"
          />
          {/* <NeuralLine
            $top="15%"
            $left="55%"
            $width="200px"
            $rotate="165deg"
            $delay="3s"
          /> */}
          {/* <NeuralLine
            $top="75%"
            $left="15%"
            $width="220px"
            $rotate="-15deg"
            $delay="2.5s"
          /> */}
          <NeuralLine
            $top="35%"
            $left="90%"
            $width="140px"
            $rotate="100deg"
            $delay="4.5s"
          />
          {/* <NeuralLine
            $top="85%"
            $left="70%"
            $width="160px"
            $rotate="190deg"
            $delay="1s"
          /> */}
          <NeuralLine
            $top="10%"
            $left="30%"
            $width="110px"
            $rotate="45deg"
            $delay="3.5s"
          />

          <AINode $top="10%" $left="15%" $size="160px" $delay="0s" />
          {/* <AINode $top="65%" $left="85%" $size="220px" $delay="1.2s" /> */}
          <AINode $top="45%" $left="12%" $size="110px" $delay="2.4s" />
          <AINode $top="15%" $left="80%" $size="130px" $delay="3.6s" />
          <AINode $top="85%" $left="10%" $size="190px" $delay="0.8s" />
          {/* <AINode $top="30%" $left="70%" $size="140px" $delay="4.2s" /> */}

          <AICircle $top="25%" $left="80%" $size="260px" $delay="0s" />
          <AICircle $top="75%" $left="20%" $size="200px" $delay="5s" />
          {/* <AICircle $top="50%" $left="50%" $size="320px" $delay="2.5s" /> */}
          <AICircle $top="10%" $left="40%" $size="150px" $delay="7s" />

          {/* <FloatingParticle $top="15%" $left="25%" $delay="0s" /> */}
          {/* <FloatingParticle $top="55%" $left="65%" $delay="2s" /> */}
          <FloatingParticle $top="85%" $left="35%" $delay="4s" />
          <FloatingParticle $top="15%" $left="65%" $delay="1s" />
          <FloatingParticle $top="95%" $left="15%" $delay="3s" />
          {/* <FloatingParticle $top="40%" $left="80%" $delay="1.5s" /> */}
          <FloatingParticle $top="70%" $left="90%" $delay="2.5s" />
          <FloatingParticle $top="30%" $left="10%" $delay="5s" />
          <FloatingParticle $top="60%" $left="20%" $delay="0.5s" />
          <FloatingParticle $top="25%" $left="45%" $delay="3.2s" />
        </AnimatedBackground>
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
      <ScrollToTop />
    </>
  );
}
