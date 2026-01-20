export interface Bot {
  id: string;
  public_key: string;
  name: string;
  description: string | null;
  tone: string;
  primary_color: string;
  created_at: string;
}

export interface CreateBotInput {
  name: string;
  description?: string;
  tone?: string;
  primaryColor?: string;
}

export interface UpdateBotInput extends CreateBotInput {
  id: string;
}
