
import BotForm from "@/components/BotForm";
import { supabase } from "@/lib/supabase";
import { Bot, CreateBotInput } from "@/types/bot";

type EditBotPageProps = {
    params: {
        id: string;
    };
};

async function getBot(id: string): Promise<Bot> {
    const res = await fetch(`http://localhost:3000/api/bots/${id}`, {
        cache: "no-store",
    });
    return res.json();
}

export default async function EditBotPage({ params }: EditBotPageProps) {
    const bot = await getBot(params.id);
    const session = await supabase.auth.getSession();

    async function updateBot(data: CreateBotInput) {
        await fetch(`http://localhost:3000/api/bots/${bot.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.data.session?.access_token}`,
            },
            body: JSON.stringify(data),
        });
        window.location.href = "/admin";
    }

    return (
        <BotForm
            initialData={bot}
            submitLabel="Update Bot"
            onSubmit={updateBot}
        />
    );
}
