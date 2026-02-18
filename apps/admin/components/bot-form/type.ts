import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";

export interface BotFormProps {
  initialData?: Bot;
  onSubmit: (data: CreateBotInput | UpdateBotInput) => void;
  submitLabel: string;
  title: string;
  loading?: boolean;
}
