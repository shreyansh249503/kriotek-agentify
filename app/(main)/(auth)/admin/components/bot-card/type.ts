import { Bot } from "@/types/bot";

export interface BotCardProps {
  bot: Bot;
  companyName?: string;
  lastTrained?: string;
  onEdit?: (bot: Bot) => void;
  onIngest?: (bot: Bot) => void;
  onDelete?: (bot: Bot) => void;
  onClick?: (bot: Bot) => void;
}
