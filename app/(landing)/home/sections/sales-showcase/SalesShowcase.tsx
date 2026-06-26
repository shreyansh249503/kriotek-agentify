"use client";

import { useEffect, useState, useRef } from "react";
import {
  SparkleIcon,
  StorefrontIcon,
  UsersIcon,
  PlayIcon,
  ArrowClockwiseIcon,
  ArrowRightIcon,
  TagIcon,
} from "@phosphor-icons/react";
import {
  SalesSection,
  ShowcaseContainer,
  HeaderWrapper,
  Badge,
  ShowcaseTitle,
  ShowcaseSubtitle,
  ContentSplit,
  InfoColumn,
  ShowcaseCard,
  IconContainer,
  TextContainer,
  CardTitle,
  CardDesc,
  ChatColumn,
  ChatDevice,
  ChatHeader,
  HeaderInfo,
  BotAvatar,
  StatusWrapper,
  BotName,
  BotStatus,
  ModeBadge,
  ChatBody,
  MessageWrapper,
  MessageBubble,
  ProductCard,
  ProductImage,
  ProductDetails,
  ProductTitle,
  ProductPrice,
  TypingContainer,
  TypingDot,
  DemoControl,
  DemoButton,
} from "./styled";
import { PrimaryButton } from "@/components";

interface DemoMessage {
  sender: "user" | "bot";
  text: string;
  product?: {
    name: string;
    price: string;
    image: string;
    url: string;
  };
}

const demoScript: DemoMessage[] = [
  {
    sender: "user",
    text: "Hello! I'm looking for a premium herbal balm for joint pain relief.",
  },
  {
    sender: "bot",
    text: "Hello! I would highly recommend our Myaxyl Balm. It's specifically formulated to soothe muscle cramps, joint pain, and stiffness using natural ingredients like Eucalyptus and Lemongrass.",
    product: {
      name: "Myaxyl Balm (50g)",
      price: "120.00 INR",
      image:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop",
      url: "/signup",
    },
  },
  {
    sender: "user",
    text: "Nice, does it have any side effects?",
  },
  {
    sender: "bot",
    text: "Not at all! It is 100% ayurvedic, side-effect free, and clinically tested. We are also running a special offer today — buy 2 balms and get free shipping!",
  },
  {
    sender: "user",
    text: "Awesome! I'd like to get the deal. Can I get a discount code?",
  },
  {
    sender: "bot",
    text: "Of course! Let me grab your name and email to apply a 15% discount code instantly to your checkout.",
  },
  {
    sender: "user",
    text: "Sure, I'm Rohan. My email is rohan@example.com",
  },
  {
    sender: "bot",
    text: "Perfect Rohan! I've sent your 15% discount code to rohan@example.com and added the free shipping voucher. Click below to complete your order!",
    product: {
      name: "Myaxyl Balm (Pack of 2) + Discount",
      price: "204.00 INR (15% Off)",
      image:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop",
      url: "/signup",
    },
  },
];

export const SalesShowcase = () => {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const resetDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages([]);
    setCurrentStep(0);
    setIsTyping(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const runStep = () => {
      if (currentStep >= demoScript.length) {
        timerRef.current = setTimeout(() => {
          resetDemo();
        }, 5000);
        return;
      }

      const nextMsg = demoScript[currentStep];

      if (nextMsg.sender === "user") {
        timerRef.current = setTimeout(() => {
          setMessages((prev) => [...prev, nextMsg]);
          setCurrentStep((prev) => prev + 1);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setIsTyping(true);

          timerRef.current = setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [...prev, nextMsg]);
            setCurrentStep((prev) => prev + 1);
          }, 1800);
        }, 800);
      }
    };

    runStep();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying]);

  return (
    <SalesSection id="sales-showcase">
      <ShowcaseContainer>
        <HeaderWrapper>
          <Badge>Featured Capability</Badge>
          <ShowcaseTitle>Increase Sales with AI Agents</ShowcaseTitle>
          <ShowcaseSubtitle>
            Convert casual store visitors into paying customers. Train your
            agent to pitch products, share checkout links, and collect warm
            leads in real time.
          </ShowcaseSubtitle>
        </HeaderWrapper>

        <ContentSplit>
          <InfoColumn>
            <ShowcaseCard>
              <IconContainer>
                <StorefrontIcon weight="duotone" />
              </IconContainer>
              <TextContainer>
                <CardTitle>Interactive Catalog Embeds</CardTitle>
                <CardDesc>
                  Upload your products and prices. The bot automatically embeds
                  visual cards with prices, descriptions, and checkout buttons
                  directly in the chat.
                </CardDesc>
              </TextContainer>
            </ShowcaseCard>

            <ShowcaseCard>
              <IconContainer>
                <SparkleIcon weight="duotone" />
              </IconContainer>
              <TextContainer>
                <CardTitle>Advanced Pitch Playbooks</CardTitle>
                <CardDesc>
                  Define custom sales instructions, special offers, and discount
                  codes. The agent acts as an expert salesperson, pitching at
                  the perfect moment.
                </CardDesc>
              </TextContainer>
            </ShowcaseCard>

            <ShowcaseCard>
              <IconContainer>
                <UsersIcon weight="duotone" />
              </IconContainer>
              <TextContainer>
                <CardTitle>Automated Lead Capture</CardTitle>
                <CardDesc>
                  Seamlessly collect client names and emails before or during
                  purchasing intent. Instantly routes leads to your inbox or CRM
                  of choice.
                </CardDesc>
              </TextContainer>
            </ShowcaseCard>
          </InfoColumn>

          <ChatColumn>
            <ChatDevice>
              <ChatHeader>
                <HeaderInfo>
                  <BotAvatar>A</BotAvatar>
                  <StatusWrapper>
                    <BotName>Agentify Sales Assistant</BotName>
                    <BotStatus>Online</BotStatus>
                  </StatusWrapper>
                </HeaderInfo>
                <ModeBadge>
                  <TagIcon size={12} weight="fill" /> Sales Mode
                </ModeBadge>
              </ChatHeader>

              <ChatBody ref={chatBodyRef}>
                {messages.length === 0 && !isTyping && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#a8a29e",
                      fontSize: "13px",
                      margin: "auto 0",
                    }}
                  >
                    Demo conversation starting...
                  </div>
                )}
                {messages.map((msg, index) => (
                  <MessageWrapper key={index} $isBot={msg.sender === "bot"}>
                    <MessageBubble $isBot={msg.sender === "bot"}>
                      {msg.text}
                    </MessageBubble>
                    {msg.product && (
                      <ProductCard>
                        <ProductImage
                          src={msg.product.image}
                          alt={msg.product.name}
                        />
                        <ProductDetails>
                          <ProductTitle>{msg.product.name}</ProductTitle>
                          <ProductPrice>{msg.product.price}</ProductPrice>
                          <PrimaryButton
                            style={{ padding: "8px 24px", fontSize: "12px" }}
                            href={msg.product.url}
                          >
                            Buy Now <ArrowRightIcon size={12} weight="bold" />
                          </PrimaryButton>
                        </ProductDetails>
                      </ProductCard>
                    )}
                  </MessageWrapper>
                ))}
                {isTyping && (
                  <MessageWrapper $isBot={true}>
                    <TypingContainer>
                      <TypingDot $delay="0s" />
                      <TypingDot $delay="0.2s" />
                      <TypingDot $delay="0.4s" />
                    </TypingContainer>
                  </MessageWrapper>
                )}
              </ChatBody>
            </ChatDevice>

            <DemoControl>
              <DemoButton onClick={resetDemo}>
                <ArrowClockwiseIcon size={14} /> Restart Demo
              </DemoButton>
              <DemoButton onClick={() => setIsPlaying((p) => !p)}>
                <PlayIcon size={14} weight={isPlaying ? "fill" : "regular"} />{" "}
                {isPlaying ? "Pause Simulation" : "Resume Simulation"}
              </DemoButton>
            </DemoControl>
          </ChatColumn>
        </ContentSplit>
      </ShowcaseContainer>
    </SalesSection>
  );
};
