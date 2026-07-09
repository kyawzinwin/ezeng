import CardManager from "@/components/admin/CardManager";
import { Panel } from "@/components/admin/ui";
import { fetchAllCards } from "@/lib/cards-query";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCardsPage() {
  const supabase = await createClient();
  const cards = await fetchAllCards(supabase);

  return (
    <Panel>
      <CardManager initialCards={cards} />
    </Panel>
  );
}
