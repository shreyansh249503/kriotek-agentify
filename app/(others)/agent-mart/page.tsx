"use client";

import { useState, useEffect, useMemo } from "react";
import { StoreContainer } from "./styled";
import { Product } from "./type";
import { useBot, useBots } from "@/hooks/useBot";
import {
  ToastNotification,
  HeroSection,
  InfoSection,
  CategorySection,
  ProductsSection,
  BannerSection,
} from "./components";

const DEFAULT_BOT_ID = "zn0ZR5xEHFp7jdhA";

export default function DemoAgentMartPage() {
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

  const isLoading = isQueryLoading || (!queryBot && isListLoading);

  const [, setCartCount] = useState<number>(0);
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

  const productsToRender = useMemo<Product[]>(() => {
    if (
      activeBot?.ecommerce_enabled &&
      activeBot.ecommerce_products &&
      activeBot.ecommerce_products.length > 0
    ) {
      return activeBot.ecommerce_products.map((p, idx) => ({
        id: p.id || `custom-prod-${idx}`,
        name:
          p.name ||
          (p as unknown as { title?: string }).title ||
          `Product ${idx + 1}`,
        price: String(p.price).startsWith("$") ? String(p.price) : `${p.price}`,
        priceNum:
          typeof p.price === "number"
            ? p.price
            : parseFloat(String(p.price)) || 0,
        description:
          p.description || "Custom product designed for your business needs.",
        image:
          p.image ||
          (p as unknown as { image_url?: string }).image_url ||
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop",
        rating: (p as unknown as { rating?: number }).rating || 5.0,
        reviews: 24 + idx * 8,
        badge: "Featured Product",
        category:
          p.category ||
          (p as unknown as { metadata?: { category?: string } }).metadata
            ?.category ||
          "Store Products",
        subCategory:
          p.subCategory ||
          (p as unknown as { metadata?: { subCategory?: string } }).metadata
            ?.subCategory ||
          "",
      }));
    }
    return [];
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
      <ToastNotification visible={isToastVisible} message={toastMessage} />
      <HeroSection
        onShopNowClick={handleScrollToProducts}
        onExploreClick={handleScrollToProducts}
      />
      <InfoSection />
      <CategorySection />
      <ProductsSection onAddToCart={handleAddToCart} />
      <BannerSection />
    </StoreContainer>
  );
}
