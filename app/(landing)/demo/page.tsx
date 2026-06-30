"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Star,
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
} from "./styled";
import { Product } from "./type";
import { useBot, useBots } from "@/hooks/useBot";

const STORE_PRODUCTS: Product[] = [
  {
    id: "myaxyl-balm",
    name: "Myaxyl Balm (50g)",
    price: "120.00 INR",
    priceNum: 120,
    description:
      "Formulated specifically to soothe joint stiffness, muscle aches, and sports cramps. Made with 100% natural Eucalyptus and Lemongrass oil.",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.8,
    reviews: 142,
    badge: "Best Seller",
  },
  {
    id: "lemongrass-oil",
    name: "Lemongrass Soothing Oil (100ml)",
    price: "250.00 INR",
    priceNum: 250,
    description:
      "Premium organic essential oil. Calms nerves, relieves stress, and acts as a natural muscle relaxant when used in aromatherapy or massage.",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.6,
    reviews: 89,
    badge: "Organic",
  },
  {
    id: "eucalyptus-spray",
    name: "Eucalyptus Pain Spray (80ml)",
    price: "180.00 INR",
    priceNum: 180,
    description:
      "Fast-acting pain relief spray. Instantly penetrates muscles for quick relief from minor joint pain, sprains, and back stiffness.",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
    rating: 4.7,
    reviews: 64,
    badge: "Fast Acting",
  },
];

export default function DemoPage() {
  const router = useRouter();

  const DEFAULT_BOT_ID = "zn0ZR5xEHFp7jdhA";
  const [botIdParam, setBotIdParam] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("botId") || params.get("bot");
      if (id) {
        setTimeout(() => {
          setBotIdParam(id);
        }, 0);
      }
    }
  }, []);

  const { data: queryBot, isLoading: isQueryLoading } = useBot(
    botIdParam || DEFAULT_BOT_ID,
  );
  const { data: userBots, isLoading: isListLoading } = useBots();

  const activeBot = useMemo(() => {
    if (queryBot) return queryBot;
    if (userBots && userBots.length > 0) return userBots[0];
    return null;
  }, [userBots, queryBot]);

  const isLoading =
    botIdParam || DEFAULT_BOT_ID ? isQueryLoading : isListLoading;

  const [cartCount, setCartCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!activeBot) return;

    const existingWidget = document.getElementById("ai-widget");
    if (existingWidget) {
      existingWidget.remove();
    }
    const existingStyle = Array.from(
      document.head.querySelectorAll("style"),
    ).find((s) => s.textContent?.includes(".product-carousel"));
    if (existingStyle) {
      existingStyle.remove();
    }
    const launchers = document.body.querySelectorAll("button");
    launchers.forEach((btn) => {
      if (btn.querySelector('img[alt="chat"]')) {
        btn.remove();
      }
    });

    const existingScript = document.querySelector(
      `script[src="/widget.js"][bot-id="${activeBot.public_key}"]`,
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.setAttribute("bot-id", activeBot.public_key || "");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      if (typeof window !== "undefined") {
        delete (window as unknown as Record<string, boolean>)[
          `__bot_initialized_${activeBot.public_key}`
        ];
      }
      const widgetEl = document.getElementById("ai-widget");
      if (widgetEl) {
        widgetEl.remove();
      }
      const styleEl = Array.from(document.head.querySelectorAll("style")).find(
        (s) => s.textContent?.includes(".product-carousel"),
      );
      if (styleEl) {
        styleEl.remove();
      }
      const btns = document.body.querySelectorAll("button");
      btns.forEach((btn) => {
        if (btn.querySelector('img[alt="chat"]')) {
          btn.remove();
        }
      });
    };
  }, [activeBot]);

  const productsToRender = useMemo(() => {
    if (
      activeBot?.ecommerce_enabled &&
      activeBot.ecommerce_products &&
      activeBot.ecommerce_products.length > 0
    ) {
      return activeBot.ecommerce_products.map((p, idx) => ({
        id: p.id || `custom-prod-${idx}`,
        name: p.name,
        price: p.price,
        priceNum: parseFloat(p.price) || 0,
        description:
          p.description || "Custom product designed for your business needs.",
        image:
          p.image ||
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
        rating: 5.0,
        reviews: 24 + idx * 8,
        badge: "Featured Product",
      }));
    }
    return STORE_PRODUCTS;
  }, [activeBot]);

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

  const handleScrollToProducts = () => {
    const productsEl = document.getElementById("featured-products");
    productsEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <StoreContainer>
      <ToastMessage $visible={isToastVisible}>
        <span>✓</span> {toastMessage}
      </ToastMessage>

      <StoreHeader>
        <StoreBrand onClick={() => router.push("/")}>
          Agentify <span>Store</span>
        </StoreBrand>

        <StoreNav>
          <StoreNavLink onClick={handleScrollToProducts}>
            Browse Products
          </StoreNavLink>
          <StoreNavLink
            onClick={() =>
              showToast(
                `${activeBot?.name} is powered by Agentify custom sales solutions.`,
              )
            }
          >
            About Us
          </StoreNavLink>
          <StoreNavLink onClick={handleScrollToProducts}>
            Customer Reviews
          </StoreNavLink>
        </StoreNav>

        <StoreActions>
          <CartIndicator
            onClick={() =>
              showToast(
                cartCount > 0
                  ? "Redirecting to checkout page..."
                  : "Your cart is empty! Consult our AI Chatbot in the bottom right to pick a product.",
              )
            }
          >
            <ShoppingCart size={18} weight="bold" />
            Cart <span>{cartCount}</span>
          </CartIndicator>
        </StoreActions>
      </StoreHeader>

      <HeroSection>
        <HeroContent>
          <HeroBadge>Personalized AI Experience</HeroBadge>
          <HeroTitle>
            Custom AI Shopping Crafted For <span>Agentify Store</span>
          </HeroTitle>
          <HeroSub>
            Welcome to Agentify Store. Chat with our sales agent below to get
            custom discounts and recommendations!
          </HeroSub>
          <HeroCTA onClick={handleScrollToProducts}>Browse Store</HeroCTA>
        </HeroContent>
      </HeroSection>

      <ProductsSection id="featured-products">
        <SectionHeader>
          <SectionSub>EXCLUSIVE OFFERS</SectionSub>
          <SectionTitle>Featured Products</SectionTitle>
        </SectionHeader>

        <ProductsGrid>
          {productsToRender.map((prod) => (
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

      <BadgesSection>
        <BadgesContainer>
          <BadgeCard>
            <ShieldCheck size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>100% Secure Checkout</BadgeTitle>
              <BadgeDesc>
                Your security is our priority. Transactions are fully encrypted.
              </BadgeDesc>
            </BadgeInfo>
          </BadgeCard>

          <BadgeCard>
            <Truck size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>Fast Delivery</BadgeTitle>
              <BadgeDesc>
                Get your products shipped and delivered quickly right to your
                doorstep.
              </BadgeDesc>
            </BadgeInfo>
          </BadgeCard>

          <BadgeCard>
            <CreditCard size={40} weight="light" />
            <BadgeInfo>
              <BadgeTitle>Easy Payments</BadgeTitle>
              <BadgeDesc>
                Supports credit cards, digital wallets, and custom invoice
                options.
              </BadgeDesc>
            </BadgeInfo>
          </BadgeCard>
        </BadgesContainer>
      </BadgesSection>

      <StoreFooter>
        <p>
          © 2026 Agentify Store. All rights reserved. Mock Demonstration Page
          for Agentify.
        </p>
      </StoreFooter>
    </StoreContainer>
  );
}
