export interface BotConfig {
  id: string;
  name: string;
  description: string;
  tone: string;
  primary_color: string;
  contact_enabled: boolean;
  contact_email: string;
  contact_prompt: string;
  ecommerce_enabled: boolean;
  ecommerce_prompt: string;
  logo_url?: string;
  public_key?: string;
}