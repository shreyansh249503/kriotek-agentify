"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lightning,
  Brain,
  Handshake,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  AboutSection,
  AboutContainer,
  HeaderArea,
  Badge,
  PageTitle,
  PageSubtitle,
  StatsSection,
  StatsGrid,
  StatCard,
  StatNumber,
  StatLabel,
  InteractiveRow,
  IllustrativeContainer,
  DemoAgentWidget,
  WidgetHeader,
  WidgetAvatar,
  WidgetTitleInfo,
  WidgetName,
  WidgetStatus,
  MessageBubble,
  MissionContent,
  SectionHeader,
  SectionParagraph,
  SectionWrapper,
  ValuesGrid,
  ValueCard,
  ValueIconWrapper,
  ValueTitle,
  ValueDesc,
  TimelineContainer,
  TimelineItem,
  TimelineDot,
  TimelineContentCard,
  TimelineYear,
  TimelineTitle,
  TimelineDesc,
  TeamGrid,
  TeamCard,
  TeamAvatarWrapper,
  TeamName,
  TeamRole,
  TeamBio,
  CTASection,
  CTABox,
  CTATitle,
  CTADesc,
  CTAButton,
} from "./styled";

export default function AboutPage() {
  return (
    <AboutSection>
      <AboutContainer>
        <HeaderArea>
          <Badge>About Agentify</Badge>
          <PageTitle>
            Empowering businesses with <span>intelligent AI agents</span>
          </PageTitle>
          <PageSubtitle>
            We are building the future of digital interaction, sales automation, and customer support with autonomous, custom-trained AI agents that work 24/7.
          </PageSubtitle>
        </HeaderArea>

        <StatsSection>
          <StatsGrid>
            <StatCard>
              <StatNumber>10M+</StatNumber>
              <StatLabel>Messages Exchanged</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>99.9%</StatNumber>
              <StatLabel>Agent Uptime</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>5,000+</StatNumber>
              <StatLabel>Active Agents</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>150+</StatNumber>
              <StatLabel>Countries Supported</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsSection>

        <InteractiveRow>
          <IllustrativeContainer>
            <DemoAgentWidget>
              <WidgetHeader>
                <WidgetAvatar>A</WidgetAvatar>
                <WidgetTitleInfo>
                  <WidgetName>Agentify Bot</WidgetName>
                  <WidgetStatus>Online</WidgetStatus>
                </WidgetTitleInfo>
              </WidgetHeader>
              <MessageBubble $isSender={false}>
                Hi! How can I help you customize your AI agent today?
              </MessageBubble>
              <MessageBubble $isSender={true}>
                Can I train you on my company&apos;s PDFs and website URLs?
              </MessageBubble>
              <MessageBubble $isSender={false}>
                Absolutely! Drop your documents or links and I&apos;ll analyze them instantly to assist your users.
              </MessageBubble>
            </DemoAgentWidget>
          </IllustrativeContainer>

          <MissionContent>
            <SectionHeader>
              Democratizing AI for <span>Every Website</span>
            </SectionHeader>
            <SectionParagraph>
              At Agentify, we believe advanced artificial intelligence shouldn&apos;t be restricted to massive tech enterprises. Our platform empowers startups, e-commerce stores, and local businesses to deploy intelligent assistants tailored specifically to their brand and knowledge base.
            </SectionParagraph>
            <SectionParagraph>
              By translating complex vector embeddings and large language models into a simple, no-code visual builder, we make it possible for anyone to launch an autonomous agent in under five minutes.
            </SectionParagraph>
          </MissionContent>
        </InteractiveRow>

        <SectionWrapper>
          <SectionHeader>
            Our Core <span>Values</span>
          </SectionHeader>
          <ValuesGrid>
            <ValueCard>
              <ValueIconWrapper>
                <ShieldCheck size={28} weight="bold" />
              </ValueIconWrapper>
              <ValueTitle>Security & Privacy First</ValueTitle>
              <ValueDesc>
                Your proprietary business knowledge is safe with us. We isolate storage environments and never use custom training data to train public foundation models.
              </ValueDesc>
            </ValueCard>

            <ValueCard>
              <ValueIconWrapper>
                <Lightning size={28} weight="bold" />
              </ValueIconWrapper>
              <ValueTitle>Instant Setup & Customization</ValueTitle>
              <ValueDesc>
                Upload PDFs, input website URLs, or sync product APIs. Copy a single embed line, and your customized AI agent is immediately live.
              </ValueDesc>
            </ValueCard>

            <ValueCard>
              <ValueIconWrapper>
                <Brain size={28} weight="bold" />
              </ValueIconWrapper>
              <ValueTitle>Deep Comprehension</ValueTitle>
              <ValueDesc>
                We look past rigid keyword matching. Our AI model architectures parse complex queries, user sentiment, and conversational context for natural interactions.
              </ValueDesc>
            </ValueCard>

            <ValueCard>
              <ValueIconWrapper>
                <Handshake size={28} weight="bold" />
              </ValueIconWrapper>
              <ValueTitle>Human-in-the-Loop Handoff</ValueTitle>
              <ValueDesc>
                We bridge autonomous automation with human touch. When queries require complex resolution, our widgets transition conversations seamlessly to your live staff.
              </ValueDesc>
            </ValueCard>
          </ValuesGrid>
        </SectionWrapper>

        <SectionWrapper>
          <SectionHeader>
            Our <span>Journey</span>
          </SectionHeader>
          <TimelineContainer>
            <TimelineItem>
              <TimelineDot />
              <TimelineContentCard>
                <TimelineYear>2024</TimelineYear>
                <TimelineTitle>The Spark</TimelineTitle>
                <TimelineDesc>
                  Agentify was born from a simple realization: current chatbots were rigid, frustrating, and difficult to set up. We started engineering a context-aware LLM pipeline for customer service.
                </TimelineDesc>
              </TimelineContentCard>
            </TimelineItem>

            <TimelineItem>
              <TimelineDot />
              <TimelineContentCard>
                <TimelineYear>2025</TimelineYear>
                <TimelineTitle>Document & Web Crawling Integration</TimelineTitle>
                <TimelineDesc>
                  We launched our automated document parsers and visual web crawling interfaces, enabling businesses to sync entire websites and FAQs into their custom knowledge base instantly.
                </TimelineDesc>
              </TimelineContentCard>
            </TimelineItem>

            <TimelineItem>
              <TimelineDot />
              <TimelineContentCard>
                <TimelineYear>2026</TimelineYear>
                <TimelineTitle>Conversational E-Commerce & Beyond</TimelineTitle>
                <TimelineDesc>
                  We expanded into transactional operations, building features for secure chatbot checkout links, item search catalogs, and multi-channel integrations like WhatsApp and Slack.
                </TimelineDesc>
              </TimelineContentCard>
            </TimelineItem>
          </TimelineContainer>
        </SectionWrapper>

        <SectionWrapper>
          <SectionHeader>
            Meet the <span>Innovators</span>
          </SectionHeader>
          <TeamGrid>
            <TeamCard>
              <TeamAvatarWrapper>AC</TeamAvatarWrapper>
              <TeamName>Alex Chen</TeamName>
              <TeamRole>Co-Founder & CEO</TeamRole>
              <TeamBio>
                Former product lead at Stripe. Passionate about software scalability, payment flows, and democratizing enterprise-grade SaaS technology.
              </TeamBio>
            </TeamCard>

            <TeamCard>
              <TeamAvatarWrapper>ER</TeamAvatarWrapper>
              <TeamName>Elena Rostova</TeamName>
              <TeamRole>Co-Founder & CTO</TeamRole>
              <TeamBio>
                Former AI infrastructure researcher at OpenAI. Specialized in optimizing vector database queries and prompt-chaining orchestration.
              </TeamBio>
            </TeamCard>

            <TeamCard>
              <TeamAvatarWrapper>MV</TeamAvatarWrapper>
              <TeamName>Marcus Vance</TeamName>
              <TeamRole>Head of AI Engineering</TeamRole>
              <TeamBio>
                Led NLP teams at Cohere. Loves tuning large language model parameters, optimizing latency, and setting up secure training flows.
              </TeamBio>
            </TeamCard>

            <TeamCard>
              <TeamAvatarWrapper>SJ</TeamAvatarWrapper>
              <TeamName>Sarah Jenkins</TeamName>
              <TeamRole>VP of Customer Success</TeamRole>
              <TeamBio>
                With over a decade leading customer support at HubSpot, she aligns Agentify’s features with real-world agent and manager pain points.
              </TeamBio>
            </TeamCard>
          </TeamGrid>
        </SectionWrapper>

        <CTASection>
          <CTABox>
            <CTATitle>
              Ready to deploy your own <span>intelligent assistant</span>?
            </CTATitle>
            <CTADesc>
              Start building in seconds. Let Agentify handle your customer support, sales generation, and user interactions around the clock.
            </CTADesc>
            <Link href="/signup" passHref style={{ textDecoration: "none" }}>
              <CTAButton>
                Get Started Free
                <ArrowRight size={20} weight="bold" />
              </CTAButton>
            </Link>
          </CTABox>
        </CTASection>
      </AboutContainer>
    </AboutSection>
  );
}
