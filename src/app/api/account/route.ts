import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// DELETE /api/account
// Cancella l'utente dall'auth schema. Le tabelle public.* legate al suo id
// (profiles, organizations.owner_id con on delete restrict, org_members, ecc.)
// sono protette da foreign key:
//   - profiles: on delete cascade -> ok, sparisce
//   - organizations.owner_id: on delete restrict -> bisogna prima eliminare
//     le organizzazioni di cui è SOLO owner.
// Per semplicità qui: rifiutiamo se l'utente è owner di una o più org con
// subscription attiva (deve disdire prima); altrimenti cancelliamo le org
// di cui è unico owner.
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const admin = createAdminClient();

  // 1. Recupera le org di cui è owner
  const { data: ownedOrgs, error: ownedErr } = await admin
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id);

  if (ownedErr) {
    return NextResponse.json({ error: "Errore lettura organizzazioni" }, { status: 500 });
  }

  // 2. Per ciascuna, verifica se c'è una subscription attiva (active/trialing/past_due)
  if (ownedOrgs && ownedOrgs.length > 0) {
    const orgIds = ownedOrgs.map((o) => o.id);
    const { data: activeSubs } = await admin
      .from("subscriptions")
      .select("organization_id, status, stripe_subscription_id")
      .in("organization_id", orgIds)
      .in("status", ["active", "past_due", "unpaid"]);

    if (activeSubs && activeSubs.length > 0) {
      return NextResponse.json(
        {
          error:
            "Hai abbonamenti attivi. Disdici dal portale di fatturazione prima di eliminare l'account.",
        },
        { status: 409 },
      );
    }

    // 3. Cancella le organizzazioni di cui è owner (cascade su tutte le tabelle figlie)
    await admin.from("organizations").delete().in("id", orgIds);
  }

  // 4. Cancella l'utente da auth.users (cascade su profiles, org_members)
  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  // 5. Sign out per pulire i cookie
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
