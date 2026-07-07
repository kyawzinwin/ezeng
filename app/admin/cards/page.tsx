import CardManager from "@/components/admin/CardManager";
import { Panel } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCardsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  const cards = (data as Card[]) ?? [];

  return (
    <Panel>
      <CardManager initialCards={cards} />
    </Panel>
  );
}
