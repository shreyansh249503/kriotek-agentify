"use client";

import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import Fashion from "@/assets/images/categorie-Fashion.svg";
import Headphone from "@/assets/images/categorie-headphone.svg";
import Beauty from "@/assets/images/categorie-beauty.svg";
import Fits from "@/assets/images/categorie-Ftns.svg";
import {
  CategorieSection,
  CategorieSectionHeader,
  CategorieSectionTitle,
  CategorieSectionSeeAll,
  CategorieSectionCardContainer,
  CategorieSectionCard,
  CategorieSectionCardImage,
  CategorieSectionCardInnerInfo,
  CategorieSectionCardTitle,
  CategorieSectionCardShopNow,
} from "../../styled";

const CATEGORY_CARDS = [
  {
    id: "fashion",
    title: "Fashion",
    image: Fashion,
    bg: "#c0ad9c",
    objectFit: "cover" as const,
    marginTop: "40px",
    padding: "0px",
    transform: "none",
  },
  {
    id: "electronics",
    title: "Electronics",
    image: Headphone,
    bg: "#c0ad9c",
    objectFit: "contain" as const,
    marginTop: "15px",
    padding: "15px",
    transform: "scale(0.95)",
  },
  {
    id: "beauty",
    title: "Beauty",
    image: Beauty,
    bg: "#c0ad9c",
    objectFit: "contain" as const,
    marginTop: "15px",
    padding: "15px",
    transform: "scale(0.95)",
  },
  {
    id: "fitness",
    title: "Fitness",
    image: Fits,
    bg: "#c0ad9c",
    objectFit: "contain" as const,
    marginTop: "0px",
    padding: "0px",
    transform: "none",
  },
];

export const CategorySection: React.FC = () => {
  const handleCategoryClick = (categoryId: string) => {
    const targetElement = document.getElementById(`category-${categoryId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const productsEl = document.getElementById("featured-products");
      productsEl?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <CategorieSection>
      <CategorieSectionHeader>
        <CategorieSectionTitle>Shop by Categories</CategorieSectionTitle>
        <CategorieSectionSeeAll onClick={() => handleCategoryClick("fashion")}>
          View All Categories <FaArrowRightLong />
        </CategorieSectionSeeAll>
      </CategorieSectionHeader>
      <CategorieSectionCardContainer>
        {CATEGORY_CARDS.map((cat) => (
          <CategorieSectionCard
            key={cat.id}
            $bg={cat.bg}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <CategorieSectionCardImage
              src={cat.image}
              alt={cat.title}
              width={800}
              height={800}
              $objectFit={cat.objectFit}
              $marginTop={cat.marginTop}
              $padding={cat.padding}
              $transform={cat.transform}
            />
            <CategorieSectionCardInnerInfo>
              <CategorieSectionCardTitle>{cat.title}</CategorieSectionCardTitle>
              <CategorieSectionCardShopNow>
                Shop Now <FaArrowRightLong size={20} />
              </CategorieSectionCardShopNow>
            </CategorieSectionCardInnerInfo>
          </CategorieSectionCard>
        ))}
      </CategorieSectionCardContainer>
    </CategorieSection>
  );
};
