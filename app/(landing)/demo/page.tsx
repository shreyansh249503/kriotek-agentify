"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Star,
  PaperPlaneRight,
  X,
  ChatTeardropText,
  ShieldCheck,
  Truck,
  CreditCard,
} from "@phosphor-icons/react";
import {
  StoreContainer,
  StoreHeader,
  StoreBrand,
  StoreNav,
  StoreNavLink,
  StoreActions,
  CartIndicator,
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroTitle,
  HeroSub,
  HeroCTA,
  ProductsSection,
  SectionHeader,
  SectionTitle,
  SectionSub,
  ProductsGrid,
  ProductCard,
  ProductImageWrapper,
  ProductImage,
  ProductBadge,
  ProductDetails,
  ProductHeader,
  ProductTitle,
  ProductPrice,
  RatingWrapper,
  ProductDescription,
  ProductActions,
  PrimaryButton,
  SecondaryButton,
  BadgesSection,
  BadgesContainer,
  BadgeCard,
  BadgeInfo,
  BadgeTitle,
  BadgeDesc,
  StoreFooter,
  ToastMessage,
  ChatLauncher,
  ChatWindow,
  ChatHeader as WidgetHeader,
  HeaderInfo,
  BotAvatar,
  BotName,
  StatusIndicator,
  CloseButton,
  ChatBody,
  MessageWrapper,
  MessageBubble,
  PresetsContainer,
  PresetPill,
  ChatFormCard,
  FormTitle,
  FormInput,
  FormSubmit,
  ChatProductCard,
  ChatProductImage,
  ChatProductDetails,
  ChatProductTitle,
  ChatProductPrice,
  ChatBuyButton,
  ChatInputContainer,
  ChatTextField,
  ChatSendButton,
  TypingIndicatorContainer,
  TypingIndicatorDot,
} from "./styled";
import { ChatMessage, Product } from "./type";

const STORE_PRODUCTS: Product[] = [
  {
    id: "myaxyl-balm",
    name: "Myaxyl Balm (50g)",
    price: "120.00 INR",
    priceNum: 120,
    description: "Formulated specifically to soothe joint stiffness, muscle aches, and sports cramps. Made with 100% natural Eucalyptus and Lemongrass oil.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.8,
    reviews: 142,
    badge: "Best Seller",
  },
  {
    id: "lemongrass-oil",
    name: "Lemongrass Soothing Oil (100ml)",
    price: "250.00 INR",
    priceNum: 250,
    description: "Premium organic essential oil. Calms nerves, relieves stress, and acts as a natural muscle relaxant when used in aromatherapy or massage.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.6,
    reviews: 89,
    badge: "Organic",
  },
  {
    id: "eucalyptus-spray",
    name: "Eucalyptus Pain Spray (80ml)",
    price: "180.00 INR",
    priceNum: 180,
    description: "Fast-acting pain relief spray. Instantly penetrates muscles for quick relief from minor joint pain, sprains, and back stiffness.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.7,
    reviews: 64,
    badge: "Fast Acting",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      sender: "bot",
      text: "Hi there 👋 I'm Aura AI, your shopping assistant! I can recommend herbal remedies, answer product queries, or offer exclusive discounts. \n\nHow can I help you today?",
      showPresets: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [leadName, setLeadName] = useState<string>("");
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const handleAddToCart = (productName: string) => {
    setCartCount((c) => c + 1);
    showToast(`${productName} added to cart!`);
  };

  const handleBuyNow = (productName: string) => {
    setCartCount((c) => c + 1);
    showToast(`Proceeding to checkout with ${productName}!`);
  };

  const handlePresetClick = (presetText: string) => {
    handleUserSendMessage(presetText);
  };

  const handleUserSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: text,
      },
    ]);
    setInputValue("");

    // 2. Trigger Bot Response Simulation
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponse = generateBotResponse(text);
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const handleLeadSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    // Add Simulated User Response
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "user",
        text: `My name is ${leadName} and email is ${leadEmail}.`,
      },
    ]);

    setLeadCaptured(true);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: `Awesome, ${leadName}! I've generated your 15% discount code: **AURA15**. It is now applied automatically. \n\nClick below to purchase the Myaxyl Balm Pack of 2 with free shipping included!`,
          product: {
            name: "Myaxyl Balm (Pack of 2) + Discount",
            price: "204.00 INR (15% Off)",
            image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
          },
        },
      ]);
    }, 1200);
  };

  // Bot response generation state machine
  const generateBotResponse = (query: string): ChatMessage => {
    const cleanQuery = query.toLowerCase().trim();
    const id = crypto.randomUUID();

    // 1. Check balm / joint pain
    if (cleanQuery.includes("balm") || cleanQuery.includes("joint") || cleanQuery.includes("myaxyl") || cleanQuery.includes("pain")) {
      return {
        id,
        sender: "bot",
        text: "I highly recommend our Myaxyl Balm! It is clinically tested to soothe joint stiffness, muscle soreness, and sprains. Formulated with ayurvedic herbs, Eucalyptus, and Lemongrass. \n\nCheck out the product details and buy it directly below:",
        product: {
          name: "Myaxyl Balm (50g)",
          price: "120.00 INR",
          image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
        },
      };
    }

    // 2. Check discount / offer / code
    if (cleanQuery.includes("discount") || cleanQuery.includes("offer") || cleanQuery.includes("deal") || cleanQuery.includes("code") || cleanQuery.includes("coupon")) {
      if (leadCaptured) {
        return {
          id,
          sender: "bot",
          text: "You've already unlocked your discount code! Use code **AURA15** at checkout for 15% off your order.",
          product: {
            name: "Myaxyl Balm (Pack of 2) + Discount",
            price: "204.00 INR (15% Off)",
            image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
          },
        };
      } else {
        return {
          id,
          sender: "bot",
          text: "I'd love to unlock a 15% discount coupon for you! Please provide your name and email in the form below to get started.",
          showLeadForm: true,
        };
      }
    }

    // 3. Side effects / Ayurvedic / Safe
    if (cleanQuery.includes("side effect") || cleanQuery.includes("ayurvedic") || cleanQuery.includes("safe") || cleanQuery.includes("natural")) {
      return {
        id,
        sender: "bot",
        text: "Our products are 100% Ayurvedic, side-effect free, and certified organic. We combine age-old recipes with advanced extraction technologies to ensure safe, natural relief.",
      };
    }

    // 4. Check essential oil / lemongrass
    if (cleanQuery.includes("oil") || cleanQuery.includes("lemongrass") || cleanQuery.includes("calm")) {
      return {
        id,
        sender: "bot",
        text: "Our Lemongrass Soothing Oil is excellent for nerve relaxation, massage, and stress relief. You can add it directly to your cart here:",
        product: {
          name: "Lemongrass Soothing Oil (100ml)",
          price: "250.00 INR",
          image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
        },
      };
    }

    // 5. Check spray / fast
    if (cleanQuery.includes("spray") || cleanQuery.includes("eucalyptus")) {
      return {
        id,
        sender: "bot",
        text: "Our Eucalyptus Pain Spray offers instant, fast-acting cooling relief for backaches, sprains, and stiffness. It's portable and mess-free. Check it out:",
        product: {
          name: "Eucalyptus Pain Spray (80ml)",
          price: "180.00 INR",
          image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
        },
      };
    }

    // 6. Check shipping / delivery
    if (cleanQuery.includes("shipping") || cleanQuery.includes("delivery") || cleanQuery.includes("deliver")) {
      return {
        id,
        sender: "bot",
        text: "We offer Free Shipping on all orders above 300 INR! For orders under 300 INR, there is a flat shipping fee of 40 INR. Deliveries take 3-5 business days.",
      };
    }

    // 7. Check contact / support
    if (cleanQuery.includes("contact") || cleanQuery.includes("support") || cleanQuery.includes("help") || cleanQuery.includes("email")) {
      return {
        id,
        sender: "bot",
        text: "You can email our customer support directly at support@auraayurveda.store, or call us at +1 (800) 555-0199. Alternatively, ask for a discount to leave your contact info with us!",
      };
    }

    // Default response
    return {
      id,
      sender: "bot",
      text: "I'm not sure if I fully understood. Feel free to ask about our Myaxyl Balm, essential oils, fast shipping options, or ask for a discount code! 🌿",
      showPresets: true,
    };
  };

  const handleScrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <StoreContainer>
      {/* Toast Notification */}
      <ToastMessage $visible={isToastVisible}>
        <span>✓</span> {toastMessage}
      </ToastMessage>

      {/* Store Header */}
      <StoreHeader>
        <StoreBrand onClick={() => router.push("/")}>
          🌿 Aura<span>Ayurveda</span>
        </StoreBrand>

        <StoreNav>
          <StoreNavLink onClick={handleScrollToProducts}>Shop Remedies</StoreNavLink>
          <StoreNavLink onClick={() => showToast("Aura Ayurveda was founded in 2012 with a mission to bring pure herbs to active lifestyles.")}>About Us</StoreNavLink>
          <StoreNavLink onClick={handleScrollToProducts}>Customer Reviews</StoreNavLink>
          <StoreNavLink onClick={() => setIsChatOpen(true)}>Consult Expert</StoreNavLink>
        </StoreNav>

        <StoreActions>
          <CartIndicator onClick={() => showToast(cartCount > 0 ? "Redirecting to checkout page..." : "Your cart is empty! Consult our AI Chatbot in the bottom right to pick a remedy.")}>
            <ShoppingCart size={18} weight="bold" />
            Cart <span>{cartCount}</span>
          </CartIndicator>
        </StoreActions>
      </StoreHeader>

      {/* Store Hero */}
      <HeroSection>
        <HeroContent>
          <HeroBadge>100% Ayurvedic &amp; Natural</HeroBadge>
          <HeroTitle>
            Ancient Wellness Crafted For <span>Modern Living</span>
          </HeroTitle>
          <HeroSub>
            Pure, clinically-tested herbal balms and oils to soothe pain, relieve stress, and support an active body.
          </HeroSub>
          <HeroCTA onClick={handleScrollToProducts}>Shop Best Sellers</HeroCTA>
        </HeroContent>
      </HeroSection>

      {/* Store Products */}
      <ProductsSection ref={productsRef}>
        <SectionHeader>
          <SectionSub>OUR SOLUTIONS</SectionSub>
          <SectionTitle>Featured Herbal Remedies</SectionTitle>
        </SectionHeader>

        <ProductsGrid>
          {STORE_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id}>
              <ProductImageWrapper>
                <ProductImage src={prod.image} alt={prod.name} />
                {prod.badge && <ProductBadge>{prod.badge}</ProductBadge>}
              </ProductImageWrapper>
              
              <ProductDetails>
                <ProductHeader>
                  <ProductTitle>{prod.name}</ProductTitle>
                  <ProductPrice>{prod.price}</ProductPrice>
                </ProductHeader>

                <RatingWrapper>
                  <Star size={16} weight="fill" />
                  <Star size={16} weight="fill" />
                  <Star size={16} weight="fill" />
                  <Star size={16} weight="fill" />
                  <Star size={16} weight="fill" />
                  <span>({prod.reviews} reviews)</span>
                </RatingWrapper>

                <ProductDescription>{prod.description}</ProductDescription>

                <ProductActions>
                  <PrimaryButton onClick={() => handleAddToCart(prod.name)}>
                    <Plus size={16} weight="bold" /> Add to Cart
                  </PrimaryButton>
                  <SecondaryButton onClick={() => handleBuyNow(prod.name)}>
                    Buy Now
                  </SecondaryButton>
                </ProductActions>
              </ProductDetails>
            </ProductCard>
          ))}
        </ProductsGrid>
      </ProductsSection>

      {/* Badges Section */}
      <BadgesSection>
        <BadgesContainer>
          <BadgeCard>
            <ShieldCheck size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>100% Natural</BadgeTitle>
              <BadgeDesc>Certified ayurvedic extracts with zero chemical additives.</BadgeDesc>
            </BadgeInfo>
          </BadgeCard>

          <BadgeCard>
            <Truck size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>Free Fast Shipping</BadgeTitle>
              <BadgeDesc>Complimentary shipping nationwide on orders above 300 INR.</BadgeDesc>
            </BadgeInfo>
          </BadgeCard>

          <BadgeCard>
            <CreditCard size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>Secure Checkout</BadgeTitle>
              <BadgeDesc>Encrypted transaction gateway for secure purchases.</BadgeDesc>
            </BadgeInfo>
          </BadgeCard>
        </BadgesContainer>
      </BadgesSection>

      {/* Store Footer */}
      <StoreFooter>
        <p>© 2026 Aura Ayurveda Store. All rights reserved. Mock Demonstration Page for Agentify.</p>
      </StoreFooter>

      {/* ========================================== */}
      {/* FLOATING CHATBOT WIDGET */}
      {/* ========================================== */}

      <ChatLauncher onClick={() => setIsChatOpen((o) => !o)}>
        {isChatOpen ? <X size={26} weight="bold" /> : <ChatTeardropText size={28} weight="fill" />}
      </ChatLauncher>

      <ChatWindow $isOpen={isChatOpen}>
        <WidgetHeader>
          <HeaderInfo>
            <BotAvatar>A</BotAvatar>
            <div>
              <BotName>Aura AI Assistant</BotName>
              <StatusIndicator>Online</StatusIndicator>
            </div>
          </HeaderInfo>
          <CloseButton onClick={() => setIsChatOpen(false)}>
            <X size={18} weight="bold" />
          </CloseButton>
        </WidgetHeader>

        <ChatBody ref={chatBodyRef}>
          {messages.map((msg) => (
            <MessageWrapper key={msg.id} $isBot={msg.sender === "bot"}>
              <MessageBubble $isBot={msg.sender === "bot"}>
                {msg.text}
              </MessageBubble>

              {/* Bot Option Presets */}
              {msg.sender === "bot" && msg.showPresets && (
                <PresetsContainer>
                  <PresetPill onClick={() => handlePresetClick("Tell me about Myaxyl Balm")}>
                    🌿 About Myaxyl Balm
                  </PresetPill>
                  <PresetPill onClick={() => handlePresetClick("Get a discount code")}>
                    🏷️ Get 15% Discount
                  </PresetPill>
                  <PresetPill onClick={() => handlePresetClick("Are products side-effect free?")}>
                    🛡️ Are they safe?
                  </PresetPill>
                </PresetsContainer>
              )}

              {/* Embedded Product checkout card */}
              {msg.product && (
                <ChatProductCard>
                  <ChatProductImage src={msg.product.image} alt={msg.product.name} />
                  <ChatProductDetails>
                    <ChatProductTitle>{msg.product.name}</ChatProductTitle>
                    <ChatProductPrice>{msg.product.price}</ChatProductPrice>
                    <ChatBuyButton onClick={() => handleBuyNow(msg.product?.name || "Product")}>
                      Checkout Now
                    </ChatBuyButton>
                  </ChatProductDetails>
                </ChatProductCard>
              )}

              {/* In-Chat Lead Form */}
              {msg.sender === "bot" && msg.showLeadForm && !leadCaptured && (
                <ChatFormCard onSubmit={handleLeadSubmit}>
                  <FormTitle>Apply Discount</FormTitle>
                  <FormInput
                    type="text"
                    placeholder="Your Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                  />
                  <FormInput
                    type="email"
                    placeholder="Your Email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                  />
                  <FormSubmit type="submit">Claim 15% Off</FormSubmit>
                </ChatFormCard>
              )}
            </MessageWrapper>
          ))}

          {/* Typing delay animation */}
          {isTyping && (
            <MessageWrapper $isBot={true}>
              <TypingIndicatorContainer>
                <TypingIndicatorDot $delay="0s" />
                <TypingIndicatorDot $delay="0.2s" />
                <TypingIndicatorDot $delay="0.4s" />
              </TypingIndicatorContainer>
            </MessageWrapper>
          )}
        </ChatBody>

        {/* Input area */}
        <ChatInputContainer
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSendMessage(inputValue);
          }}
        >
          <ChatTextField
            type="text"
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <ChatSendButton type="submit" disabled={!inputValue.trim() || isTyping}>
            <PaperPlaneRight size={18} weight="fill" />
          </ChatSendButton>
        </ChatInputContainer>
      </ChatWindow>
    </StoreContainer>
  );
}
