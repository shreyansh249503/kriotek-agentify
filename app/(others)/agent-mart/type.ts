export interface Product {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  category?: string;
  subCategory?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  product?: {
    name: string;
    price: string;
    image: string;
  };
  showLeadForm?: boolean;
  showPresets?: boolean;
}
