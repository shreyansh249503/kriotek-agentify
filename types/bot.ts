export interface Bot {
  id: string;
  public_key: string;
  name: string;
  description: string | null;
  tone: string;
  primary_color: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  contact_enabled: boolean;
  contact_email: string;
  contact_prompt: string;
  contact_email_message: string;
  logo_url?: string | null;
  ecommerce_enabled?: boolean;
  ecommerce_prompt?: string | null;
  ecommerce_products?: Product[];
  company_name?: string | null;
  last_trained_at?: string | null;
}

export interface ProductVariant {
  id?: string;
  title?: string;
  price?: string | number;
  sku?: string;
  available?: boolean;
  color?: string;
  size?: string;
  style?: string;
  material?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface ProductMetadata {
  category?: string;
  subCategory?: string;
  color?: string | string[];
  size?: string | string[];
  style?: string | string[];
  type?: string;
  material?: string | string[];
  gender?: "men" | "women" | "unisex" | "kids" | string;
  brand?: string;
  features?: string[];
  specifications?: Record<string, string | number | boolean>;
  tags?: string[];
  dimensions?: string;
  rating?: number;
  inStock?: boolean;
  customAttributes?: Record<string, unknown>;
}

export interface Product {
  id?: string;
  shopify_id?: string;
  name: string;
  title?: string;
  price: string | number;
  currency?: string;
  image: string;
  image_url?: string;
  images?: string[];
  url: string;
  description?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  available?: boolean;
  variants?: ProductVariant[];
  metadata?: ProductMetadata;
}

export interface CreateBotInput {
  name: string;
  description?: string;
  tone?: string;
  primaryColor?: string;
  contactEnabled?: boolean;
  contactEmail?: string;
  contactPrompt?: string;
  contactEmailMessage?: string;
  logoUrl?: string;
  ecommerceEnabled?: boolean;
  ecommercePrompt?: string;
  ecommerceProducts?: Product[];
  companyName?: string;
  lastTrainedAt?: string;
}

export interface UpdateBotInput extends CreateBotInput {
  id: string;
}
