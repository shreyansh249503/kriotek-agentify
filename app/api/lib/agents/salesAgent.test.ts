import {
  matchAndRankProducts,
  buildSalesSystemPrompt,
  type CustomerRequirements,
} from "./salesAgent";
import { Product } from "@/types/bot";

describe("salesAgent", () => {
  const sampleProducts: Product[] = [
    {
      id: "prod-1",
      name: "Oversized Heavyweight Hoodie",
      price: "$85.00",
      image: "https://example.com/hoodie-black.jpg",
      url: "https://example.com/products/oversized-hoodie",
      description: "Cozy fleece oversized hoodie in midnight black.",
      category: "Apparel",
      subCategory: "Hoodie",
      brand: "UrbanWear",
      variants: [
        { id: "v1", title: "Black / XL", color: "Black", size: "XL", style: "Oversized", price: 85 },
        { id: "v2", title: "Black / L", color: "Black", size: "L", style: "Oversized", price: 85 },
      ],
      metadata: {
        color: ["Black", "Grey"],
        size: ["L", "XL"],
        style: "Oversized",
        material: "Fleece Cotton",
        brand: "UrbanWear",
      },
    },
    {
      id: "prod-2",
      name: "Classic Regular Fit Hoodie",
      price: "$65.00",
      image: "https://example.com/hoodie-regular.jpg",
      url: "https://example.com/products/classic-hoodie",
      description: "Standard fit cotton hoodie for daily wear.",
      category: "Apparel",
      subCategory: "Hoodie",
      brand: "UrbanWear",
      variants: [
        { id: "v3", title: "Black / XL", color: "Black", size: "XL", style: "Regular Fit", price: 65 },
        { id: "v4", title: "Blue / XL", color: "Blue", size: "XL", style: "Regular Fit", price: 65 },
      ],
      metadata: {
        color: ["Black", "Blue"],
        size: ["M", "L", "XL"],
        style: "Regular Fit",
        material: "100% Cotton",
        brand: "UrbanWear",
      },
    },
    {
      id: "prod-3",
      name: "Apex Wireless ANC Headphones",
      price: "$199.00",
      image: "https://example.com/headphones.jpg",
      url: "https://example.com/products/apex-headphones",
      description: "Active noise cancelling over-ear wireless headphones.",
      category: "Electronics",
      subCategory: "Headphones",
      brand: "ApexAudio",
      metadata: {
        color: "Silver",
        style: "Over-Ear Wireless",
        features: ["Active Noise Cancelling", "40hr Battery", "Bluetooth 5.3"],
        brand: "ApexAudio",
      },
    },
  ];

  describe("matchAndRankProducts", () => {
    it("should score and rank exact match highest for multi-attribute query", () => {
      const reqs: CustomerRequirements = {
        category: "Apparel",
        subCategory: "Hoodie",
        color: "Black",
        size: "XL",
        style: "Oversized",
      };

      const ranked = matchAndRankProducts(sampleProducts, reqs);

      expect(ranked.length).toBe(3);
      // prod-1 matches category, color, size, style -> highest score
      expect(ranked[0].product.id).toBe("prod-1");
      expect(ranked[0].isExactMatch).toBe(true);
      expect(ranked[0].isPartialMatch).toBe(false);
      expect(ranked[0].matchedAttributes).toContain("Category: Hoodie");
      expect(ranked[0].matchedAttributes).toContain("Color: Black");
      expect(ranked[0].matchedAttributes).toContain("Size: XL");
      expect(ranked[0].matchedAttributes).toContain("Style: Oversized");
    });

    it("should identify partial matches and explain differing attributes", () => {
      const reqs: CustomerRequirements = {
        subCategory: "Hoodie",
        color: "Black",
        size: "XL",
        style: "Regular Fit",
      };

      const ranked = matchAndRankProducts(sampleProducts, reqs);

      // prod-2 is exact match for Regular Fit
      expect(ranked[0].product.id).toBe("prod-2");
      expect(ranked[0].isExactMatch).toBe(true);

      // prod-1 is partial match (matches category, color, size, but style is Oversized instead of Regular Fit)
      const partialMatch = ranked.find((r) => r.product.id === "prod-1");
      expect(partialMatch).toBeDefined();
      expect(partialMatch?.isPartialMatch).toBe(true);
      expect(partialMatch?.differingAttributes.some((d) => d.attribute === "Style")).toBe(true);
      expect(partialMatch?.matchRationale).toContain("Style is Oversized (requested Regular Fit)");
    });

    it("should filter and score by budget constraint", () => {
      const reqs: CustomerRequirements = {
        subCategory: "Hoodie",
        maxPrice: 70,
      };

      const ranked = matchAndRankProducts(sampleProducts, reqs);

      // prod-2 ($65) is within budget $70, prod-1 ($85) exceeds budget
      expect(ranked[0].product.id).toBe("prod-2");
      expect(ranked[0].matchedAttributes).toContain("Within budget: $65.00");
    });

    it("should support category-specific electronics features and specs", () => {
      const reqs: CustomerRequirements = {
        category: "Electronics",
        features: ["Active Noise Cancelling"],
        brand: "ApexAudio",
      };

      const ranked = matchAndRankProducts(sampleProducts, reqs);

      expect(ranked[0].product.id).toBe("prod-3");
      expect(ranked[0].matchedAttributes).toContain("Brand: ApexAudio");
      expect(ranked[0].matchedAttributes).toContain("Feature: Active Noise Cancelling");
    });
  });

  describe("buildSalesSystemPrompt", () => {
    it("should build prompt with customer requirements and ranked recommendations", () => {
      const reqs: CustomerRequirements = {
        subCategory: "Hoodie",
        color: "Black",
        size: "XL",
      };

      const ranked = matchAndRankProducts(sampleProducts, reqs);

      const prompt = buildSalesSystemPrompt(
        {
          companyName: "TrendWear",
          companyDescription: "Modern streetwear boutique",
          tone: "friendly",
        },
        { websiteContext: "We offer premium urban clothing." },
        {
          collected: { name: "Sam" },
          missingFields: ["email"],
          isComplete: false,
        },
        reqs,
        ranked,
        sampleProducts,
      );

      expect(prompt).toContain("You are an expert, confident, and consultative Sales Specialist for TrendWear.");
      expect(prompt).toContain("CUSTOMER REQUIREMENTS IDENTIFIED");
      expect(prompt).toContain("subCategory: Hoodie");
      expect(prompt).toContain("color: Black");
      expect(prompt).toContain("size: XL");
      expect(prompt).toContain("RANKED PRODUCT MATCHES & METADATA ANALYSIS");
      expect(prompt).toContain("Oversized Heavyweight Hoodie");
      expect(prompt).toContain("<product-carousel>");
      expect(prompt).toContain("CONTACT COLLECTION: Contact collection is still pending (Still need: email)");
    });
  });
});
