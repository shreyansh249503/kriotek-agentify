import { redirect } from "next/navigation";

// This route used to fetch the bot server-side without credentials. Bot editing
// lives at /admin/bot/[id]/edit-bot, so send anyone landing here to the list.
export default function BotKeyPage() {
  redirect("/admin/bots");
}
