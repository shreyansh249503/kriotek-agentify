"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  MinusCircle,
  CaretDown,
  CaretUp,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";
import {
  PricingSection,
  PricingContainer,
  HeaderArea,
  Badge,
  PageTitle,
  PageSubtitle,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  DiscountBadge,
  CardsGrid,
  PlanCard,
  PopularBadge,
  CardTop,
  PlanName,
  PlanDesc,
  PriceWrapper,
  Currency,
  Price,
  Period,
  FeaturesList,
  FeatureItem,
  CTAButton,
  CompareSection,
  SectionTitle,
  TableContainer,
  CompareTable,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
  FaqSection,
  FaqList,
  FaqCard,
  FaqQuestionButton,
  FaqAnswerWrapper,
  FaqAnswerContent,
} from "./styled";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleBilling = () => {
    setIsYearly((prev) => !prev);
  };

  const handleFaqToggle = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for exploring AI agents and personal projects.",
      priceMonthly: 0,
      priceYearly: 0,
      cta: "Get Started Free",
      href: "/signup",
      isPopular: false,
      features: [
        { text: "1 AI Agent", included: true },
        { text: "50 messages per month", included: true },
        { text: "1 Knowledge Base source (up to 2MB)", included: true },
        { text: "Standard Web Widget Embed", included: true },
        { text: "Basic Analytics dashboard", included: true },
        { text: "Custom Branding", included: false },
        { text: "API & Webhook access", included: false },
        { text: "Sales & E-Commerce catalog", included: false },
      ],
    },
    {
      name: "Pro",
      desc: "Ideal for growing businesses needing custom sales & service bots.",
      priceMonthly: 29,
      priceYearly: 24, // $24 * 12 = $288 / year
      cta: "Start Free Trial",
      href: "/signup",
      isPopular: true,
      features: [
        { text: "5 AI Agents", included: true },
        { text: "2,000 messages per month", included: true },
        { text: "10 Knowledge Base sources (up to 20MB)", included: true },
        { text: "Remove 'Powered by Agentify'", included: true },
        { text: "Advanced Web Widget customizations", included: true },
        { text: "API Access & developer webhooks", included: true },
        { text: "Sales & E-Commerce Mode (Checkout links)", included: true },
        { text: "Prioritized Email support", included: true },
      ],
    },
    {
      name: "Enterprise",
      desc: "For heavy scales requiring white-label, priority SLA, and custom flows.",
      priceMonthly: 149,
      priceYearly: 119, // $119 * 12 = $1428 / year
      cta: "Contact Sales",
      href: "/signup",
      isPopular: false,
      features: [
        { text: "Unlimited AI Agents", included: true },
        { text: "20,000+ messages per month", included: true },
        { text: "Unlimited Knowledge Base sources", included: true },
        { text: "Fully White-labeled (Custom domains)", included: true },
        { text: "Advanced integrations (Slack, WhatsApp, Discord)", included: true },
        { text: "Dedicated hosting option", included: true },
        { text: "Fine-tuned models & custom prompting SLA", included: true },
        { text: "24/7 dedicated support manager", included: true },
      ],
    },
  ];

  // FAQ Details
  const faqs = [
    {
      q: "Can I change plans at any time?",
      a: "Yes, absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your billing dashboard. If you upgrade, the change is applied instantly and prorated. If you cancel, your access will continue until the end of the current billing cycle.",
    },
    {
      q: "What counts as a 'message' in my monthly limit?",
      a: "A message counts as any single prompt query resolved by your AI agent. System checks, status pings, and training triggers are free and do not count toward your quota. If you exceed your monthly message limits, we will notify you and give you options to upgrade or top-up without suspending your agent.",
    },
    {
      q: "How do I train my AI agent with custom knowledge?",
      a: "You can train your agent by uploading PDF documents, word files, text files, entering website URLs (our system will crawl them), or adding custom Q&A sheets. The bot processes your input within seconds, enabling it to answer business-specific queries instantly.",
    },
    {
      q: "Is my customer data secure?",
      a: "Yes. Data privacy and security are our top priorities. All transmissions are encrypted using standard SSL, and knowledge bases are isolated in secure databases. We do not use your proprietary business files or user conversations to train public LLM models.",
    },
    {
      q: "Can I connect my agent to my existing product catalogs?",
      a: "Yes! With our Sales & E-Commerce Mode (available on Pro and Enterprise), you can configure product names, image links, pricing, and custom payment links. Your agent will dynamically fetch and showcase products inside the chat window when users ask about purchasing.",
    },
  ];

  return (
    <PricingSection>
      <PricingContainer>
        <HeaderArea>
          <Badge>Transparent Pricing</Badge>
          <PageTitle>
            Flexible plans for <span>every business scale</span>
          </PageTitle>
          <PageSubtitle>
            Deploy custom-trained AI agents on your site in minutes. Scale seamlessly as your conversations grow.
          </PageSubtitle>
          <ToggleContainer>
            <ToggleLabel $isActive={!isYearly} onClick={() => setIsYearly(false)}>
              Monthly
            </ToggleLabel>
            <ToggleSwitch
              className={isYearly ? "yearly" : ""}
              onClick={toggleBilling}
            />
            <ToggleLabel $isActive={isYearly} onClick={() => setIsYearly(true)}>
              Yearly Billed
            </ToggleLabel>
            <DiscountBadge>Save 20%</DiscountBadge>
          </ToggleContainer>
        </HeaderArea>
        <CardsGrid>
          {plans.map((plan, index) => {
            const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <PlanCard key={index} $isPopular={plan.isPopular}>
                {plan.isPopular && (
                  <PopularBadge>
                    <Sparkle size={14} weight="fill" /> Most Popular
                  </PopularBadge>
                )}

                <CardTop>
                  <PlanName>{plan.name}</PlanName>
                  <PlanDesc>{plan.desc}</PlanDesc>
                  <PriceWrapper>
                    <Currency>$</Currency>
                    <Price>{displayPrice}</Price>
                    <Period>/month</Period>
                  </PriceWrapper>
                </CardTop>

                <FeaturesList>
                  {plan.features.map((feat, idx) => (
                    <FeatureItem key={idx} $isIncluded={feat.included}>
                      {feat.included ? (
                        <CheckCircle size={18} weight="fill" />
                      ) : (
                        <MinusCircle size={18} weight="fill" />
                      )}
                      {feat.text}
                    </FeatureItem>
                  ))}
                </FeaturesList>

                <Link href={plan.href} passHref style={{ textDecoration: "none", width: "100%" }}>
                  <CTAButton $isPrimary={plan.isPopular}>
                    {plan.cta}
                    <ArrowRight size={16} weight="bold" />
                  </CTAButton>
                </Link>
              </PlanCard>
            );
          })}
        </CardsGrid>

        <CompareSection>
          <SectionTitle>Compare Plan Features</SectionTitle>
          <TableContainer>
            <CompareTable>
              <TableHead>
                <TableRow $isHeader={true}>
                  <TableHeaderCell>Feature Description</TableHeaderCell>
                  <TableHeaderCell>Starter</TableHeaderCell>
                  <TableHeaderCell>Pro</TableHeaderCell>
                  <TableHeaderCell>Enterprise</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                <TableRow>
                  <TableCell>AI Agents Limit</TableCell>
                  <TableCell>1 Agent</TableCell>
                  <TableCell>Up to 5 Agents</TableCell>
                  <TableCell>Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Conversations</TableCell>
                  <TableCell>50 Messages</TableCell>
                  <TableCell>2,000 Messages</TableCell>
                  <TableCell>20,000+ (Custom Scaling)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Knowledge Base Files</TableCell>
                  <TableCell>1 Source (2MB limit)</TableCell>
                  <TableCell>10 Sources (20MB limit)</TableCell>
                  <TableCell>Unlimited (Dedicated storage)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Widget Custom Styling</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>Advanced (Colors, Avatars)</TableCell>
                  <TableCell>Full CSS & White-Label</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remove Branding</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /></TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /> (Custom Domain)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sales Mode & Checkout</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /></TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>API & Webhook Access</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /></TableCell>
                  <TableCell><CheckCircle size={20} weight="fill" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Support SLA</TableCell>
                  <TableCell>Community Forums</TableCell>
                  <TableCell>Email Support (24h SLA)</TableCell>
                  <TableCell>24/7 Priority Dedicated SLA</TableCell>
                </TableRow>
              </tbody>
            </CompareTable>
          </TableContainer>
        </CompareSection>

        <FaqSection>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <FaqList>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <FaqCard key={index} $isOpen={isOpen}>
                  <FaqQuestionButton onClick={() => handleFaqToggle(index)}>
                    {faq.q}
                    {isOpen ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
                  </FaqQuestionButton>
                  <FaqAnswerWrapper $maxHeight={isOpen ? "200px" : "0px"}>
                    <FaqAnswerContent>{faq.a}</FaqAnswerContent>
                  </FaqAnswerWrapper>
                </FaqCard>
              );
            })}
          </FaqList>
        </FaqSection>
      </PricingContainer>
    </PricingSection>
  );
}
