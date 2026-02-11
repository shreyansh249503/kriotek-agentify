export interface Bot {
  id: string;
  public_key: string;
  name: string;
  description: string | null;
  tone: string;
  primary_color: string;
  created_at: string;
  contact_prompt: string;
  contact_email_message: string;
}

export interface CreateBotInput {
  name: string;
  description?: string;
  tone?: string;
  primaryColor?: string;
  contactPrompt?: string;
  contactEmailMessage?: string;
}

export interface UpdateBotInput extends CreateBotInput {
  id: string;
}
