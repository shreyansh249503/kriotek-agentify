"use client";

import React, { useState } from "react";
import { Star, Heart, ShoppingCart } from "@phosphor-icons/react";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  ProductsSection as ProductsSectionContainer,
  CategoryGroup,
  CategoryGroupHeader,
  CategoryGroupTitle,
  CategoryGroupViewAll,
  CategoryProductsGrid,
  CategoryProductCard,
  WishlistButton,
  CategoryProductImageWrapper,
  CategoryProductImage,
  CategoryProductInfo,
  CategoryProductTitle,
  CategoryProductPrice,
  CategoryProductRatingRow,
  StarsContainer,
  ReviewsText,
  CartCircleButton,
} from "../../styled";

export interface StaticProductItem {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  isLiked?: boolean;
}

export interface StaticCategoryGroup {
  id: string;
  title: string;
  products: StaticProductItem[];
}

export const STATIC_CATEGORIES: StaticCategoryGroup[] = [
  {
    id: "fashion",
    title: "Fashion your Style",
    products: [
      {
        id: "fashion-1",
        name: "Oni pink Hoodie",
        price: "$59.60",
        rating: 4.5,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop",
      },
      {
        id: "fashion-2",
        name: "Air Max Safari",
        price: "$20.30",
        rating: 5.0,
        reviews: 325,
        isLiked: true,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      },
      {
        id: "fashion-3",
        name: "Thalasi Over size t-shirt",
        price: "$19.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop",
      },
      {
        id: "fashion-4",
        name: "Linen pent",
        price: "$20.60",
        rating: 4.5,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop",
      },
      {
        id: "fashion-5",
        name: "Cornet line shirt",
        price: "$13.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "electronics",
    title: "Electronic Devices",
    products: [
      {
        id: "elec-1",
        name: "4K Google smart TV",
        price: "$189.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1593784991095-877102484462?w=500&auto=format&fit=crop",
      },
      {
        id: "elec-2",
        name: "Samsung 16sv refrigerator",
        price: "$200.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop",
      },
      {
        id: "elec-3",
        name: "Modern juicer mixer",
        price: "$27.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop",
      },
      {
        id: "elec-4",
        name: "Extendable 30v fan",
        price: "$18.20",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1618941709602-92849f611320?w=500&auto=format&fit=crop",
      },
      {
        id: "elec-5",
        name: "Aqua-guard water purifier",
        price: "$29.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1548839140-29a749e1cf4e?w=500&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "beauty",
    title: "Beauty Products",
    products: [
      {
        id: "beauty-1",
        name: "Rose gold matte lipstick",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop",
      },
      {
        id: "beauty-2",
        name: "Loreal hair serum",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1608248597261-833258657640?w=500&auto=format&fit=crop",
      },
      {
        id: "beauty-3",
        name: "Valentino pine",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop",
      },
      {
        id: "beauty-4",
        name: "Pantene PRO-V",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop",
      },
      {
        id: "beauty-5",
        name: "Matte black eye liner",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=500&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "fitness",
    title: "Fitness Equipment",
    products: [
      {
        id: "fitness-1",
        name: "Bicicleta Bike",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop",
      },
      {
        id: "fitness-2",
        name: "Adjustable Dumbbell",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop",
      },
      {
        id: "fitness-3",
        name: "Yoga Mat",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop",
      },
      {
        id: "fitness-4",
        name: "Ballistyx Jump Rope",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop",
      },
      {
        id: "fitness-5",
        name: "Bantch press",
        price: "$59.60",
        rating: 4.0,
        reviews: 128,
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop",
      },
    ],
  },
];

interface ProductsSectionProps {
  onAddToCart?: (productName: string) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onAddToCart,
}) => {
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({
    "fashion-2": true,
  });

  const toggleWishlist = (id: string) => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ProductsSectionContainer id="featured-products">
      {STATIC_CATEGORIES.map((category) => (
        <CategoryGroup key={category.id} id={`category-${category.id}`}>
          <CategoryGroupHeader>
            <CategoryGroupTitle>{category.title}</CategoryGroupTitle>
            <CategoryGroupViewAll>
              View All <FaArrowRightLong size={14} />
            </CategoryGroupViewAll>
          </CategoryGroupHeader>

          <CategoryProductsGrid>
            {category.products.map((prod) => {
              const isLiked = !!likedMap[prod.id] || !!prod.isLiked;
              return (
                <CategoryProductCard key={prod.id}>
                  <WishlistButton
                    onClick={() => toggleWishlist(prod.id)}
                    $isLiked={isLiked}
                  >
                    <Heart
                      size={18}
                      weight={isLiked ? "fill" : "regular"}
                      color={isLiked ? "#e63946" : "#888888"}
                    />
                  </WishlistButton>

                  <CategoryProductImageWrapper>
                    <CategoryProductImage
                      src={prod.image}
                      alt={prod.name}
                      width={300}
                      height={300}
                    />
                  </CategoryProductImageWrapper>

                  <CategoryProductInfo>
                    <CategoryProductTitle title={prod.name}>
                      {prod.name}
                    </CategoryProductTitle>
                    <CategoryProductPrice>{prod.price}</CategoryProductPrice>

                    <CategoryProductRatingRow>
                      <StarsContainer>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight={
                              i < Math.floor(prod.rating) ? "fill" : "regular"
                            }
                            color={
                              i < Math.floor(prod.rating) ? "#f59e0b" : "#d1d5db"
                            }
                          />
                        ))}
                      </StarsContainer>
                      <ReviewsText>({prod.reviews})</ReviewsText>
                    </CategoryProductRatingRow>

                    <CartCircleButton
                      onClick={() => onAddToCart && onAddToCart(prod.name)}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={18} weight="bold" />
                    </CartCircleButton>
                  </CategoryProductInfo>
                </CategoryProductCard>
              );
            })}
          </CategoryProductsGrid>
        </CategoryGroup>
      ))}
    </ProductsSectionContainer>
  );
};
