import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adDecisionSchema } from "@/features/ads/schemas";

export async function moderateAd(req: Request, adId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = adDecisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const nextStatus = parsed.data.decision === "approve" ? "payment_pending" : "rejected";

  const { error } = await supabase
    .from("ads")
    .update({ status: nextStatus, moderation_notes: parsed.data.notes ?? null })
    .eq("id", adId)
    .in("status", ["submitted", "under_review"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}

