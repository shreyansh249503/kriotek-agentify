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
}

export interface Product {
  id?: string;
  name: string;
  price: string;
  image: string;
  url: string;
  description?: string;
  image_url?: string;
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
}

export interface UpdateBotInput extends CreateBotInput {
  id: string;
}
