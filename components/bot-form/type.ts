import { Bot, CreateBotInput, UpdateBotInput } from "@/types/bot";

export interface BotFormProps {
  initialData?: Bot;
  onSubmit: (data: CreateBotInput | UpdateBotInput) => void;
  submitLabel: string;
  loading?: boolean;
  /** Shown above the submit button, e.g. when the API rejects the settings. */
  error?: string | null;
}
