"use client";

import React, { useState, useEffect } from "react";
import {
  BannerSectionContainer,
  FlashSaleBannerCard,
  DarkBannerCard,
  BannerContent,
  BannerSubtitle,
  BannerTitle,
  BannerDescription,
  TimerContainer,
  TimerDigitsRow,
  TimerLabelsRow,
  BannerButton,
  BannerVisualWrapper,
  BannerImage,
  BannerShoeImage,
  BannerVisualWrapper2,
  BannerInnerImage,
} from "./styled";
import CardBg1 from "@/assets/images/banner-Card-bg.svg"
import CardBg2 from "@/assets/images/banner-Card2-bg.svg"
import CardShoe from "@/assets/images/banner-card-Shoe.svg"
import CardGirl from "@/assets/images/banner-card-girl.svg"

export const BannerSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 15,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  const handleScrollToProducts = () => {
    const productsEl = document.getElementById("featured-products");
    productsEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <BannerSectionContainer>
      <FlashSaleBannerCard>
        <BannerInnerImage
          src={CardBg1}
          alt="Flash Sale Sneakers"
          width={500}
          height={500}
          priority
        />
        <BannerContent>
          <BannerSubtitle>Flash Sale</BannerSubtitle>
          <BannerTitle>Up To 70% Off</BannerTitle>

          <TimerContainer>
            <TimerDigitsRow>
              <span>{formatNumber(timeLeft.days)}</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.hours)}</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.minutes)}</span>
              <span>:</span>
              <span>{formatNumber(timeLeft.seconds)}</span>
            </TimerDigitsRow>

            <TimerLabelsRow>
              <span>Days</span>
              <span>Hours</span>
              <span>Mins</span>
              <span>Secs</span>
            </TimerLabelsRow>
          </TimerContainer>

          <BannerButton $textColor="#ff5314" onClick={handleScrollToProducts}>
            Shop Collection
          </BannerButton>
        </BannerContent>
        <BannerVisualWrapper>
          <BannerShoeImage
            src={CardShoe}
            alt="Flash Sale Sneakers"
            width={500}
            height={500}
            priority
          />
        </BannerVisualWrapper>
      </FlashSaleBannerCard>

      <DarkBannerCard>
        <BannerInnerImage
          src={CardBg2}
          alt="Flash Sale Sneakers"
          width={500}
          height={500}
          priority
        />
        <BannerContent>
          <BannerSubtitle>New Collection</BannerSubtitle>
          <BannerTitle>Summer 2026</BannerTitle>
          <BannerDescription>
            Discover the Latest trends and fresh styles
          </BannerDescription>

          <BannerButton $textColor="#111111" onClick={handleScrollToProducts}>
            Shop Collection
          </BannerButton>
        </BannerContent>

        <BannerVisualWrapper2>
          <BannerImage
            src={CardGirl}
            alt="Summer 2026 Collection Model"
            width={500}
            height={500}
            priority
          />
        </BannerVisualWrapper2>
      </DarkBannerCard>
    </BannerSectionContainer>
  );
};
