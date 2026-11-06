"use client";

import React from "react";
import Image from "next/image";
import HeroGirl from "@/assets/images/Agentmart-herogirl.svg";
import Bg1 from "@/assets/images/Agentmart-bgobject.svg";
import Bg2 from "@/assets/images/Agentmart-bgobject2.svg";
import Shoes from "@/assets/images/shoes.svg";
import Watch from "@/assets/images/watch.svg";
import Bottle from "@/assets/images/bottle.svg";
import Headphones from "@/assets/images/headphone.svg";
import {
  HeroSection as HeroSectionContainer,
  HeroContainer,
  HeroLeft,
  HeroBadge,
  HeroTitle,
  HeroSub,
  HeroCTAWrapper,
  HeroPrimaryCTA,
  HeroSecondaryCTA,
  HeroSocialProof,
  AvatarGroup,
  AvatarImg,
  SocialProofText,
  HeroRight,
  HeroVisualContainer,
  HeroBgShape,
  HeroBgShape2,
  HeroMainImageWrapper,
  FloatingProductCard,
  FloatingCardImage,
  FloatingCardInfo,
  FloatingCardTitle,
  FloatingCardPrice,
} from "../../styled";

const FLOATING_PRODUCTS = [
  {
    id: "shoes",
    position: "top-left" as const,
    image: Shoes,
    title: "Red Chief 530",
    price: "$120.32",
  },
  {
    id: "watch",
    position: "top-right" as const,
    image: Watch,
    title: "Smart Watch",
    price: "$56.43",
  },
  {
    id: "headphones",
    position: "bottom-left" as const,
    image: Headphones,
    title: "Wireless Headphones",
    price: "$40.34",
  },
  {
    id: "bottle",
    position: "bottom-right" as const,
    image: Bottle,
    title: "Water Bottle",
    price: "$20.00",
  },
];

interface HeroSectionProps {
  onShopNowClick?: () => void;
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopNowClick,
  onExploreClick,
}) => {
  return (
    <HeroSectionContainer>
      <HeroContainer>
        <HeroLeft>
          <HeroBadge>TRENDING NOW</HeroBadge>
          <HeroTitle>
            Discover Products <span>You’ll Love</span>
          </HeroTitle>
          <HeroSub>
            Shop the latest trending products created for modern lifestyles.
          </HeroSub>

          <HeroCTAWrapper>
            <HeroPrimaryCTA onClick={onShopNowClick}>
              Shop Now
            </HeroPrimaryCTA>
            <HeroSecondaryCTA onClick={onExploreClick}>
              Explore Collection
            </HeroSecondaryCTA>
          </HeroCTAWrapper>

          <HeroSocialProof>
            <AvatarGroup>
              <AvatarImg
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                alt="User 1"
              />
              <AvatarImg
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop"
                alt="User 2"
              />
              <AvatarImg
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop"
                alt="User 3"
              />
              <AvatarImg
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop"
                alt="User 4"
              />
            </AvatarGroup>
            <SocialProofText>Loved by 50,000+ Users</SocialProofText>
          </HeroSocialProof>
        </HeroLeft>

        <HeroRight>
          <HeroVisualContainer>
            <HeroBgShape
              src={Bg1}
              alt="Background Graphic 1"
              priority
              width={700}
              height={700}
            />
            <HeroBgShape2
              src={Bg2}
              alt="Background Graphic 2"
              priority
              width={700}
              height={700}
            />

            <HeroMainImageWrapper>
              <Image
                src={HeroGirl}
                alt="Featured Model"
                width={700}
                height={700}
              />
            </HeroMainImageWrapper>

            {FLOATING_PRODUCTS.map((prod) => (
              <FloatingProductCard key={prod.id} $position={prod.position}>
                <FloatingCardImage
                  src={prod.image}
                  alt={prod.title}
                  width={500}
                  height={500}
                />
                <FloatingCardInfo>
                  <FloatingCardTitle>{prod.title}</FloatingCardTitle>
                  <FloatingCardPrice>{prod.price}</FloatingCardPrice>
                </FloatingCardInfo>
              </FloatingProductCard>
            ))}
          </HeroVisualContainer>
        </HeroRight>
      </HeroContainer>
    </HeroSectionContainer>
  );
};
