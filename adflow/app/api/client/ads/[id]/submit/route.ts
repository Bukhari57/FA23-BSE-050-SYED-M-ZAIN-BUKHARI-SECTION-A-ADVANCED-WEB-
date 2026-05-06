import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api-guard";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(["client"]);
  if (gate.blocked) return gate.blocked;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("ads")
    .update({ status: "submitted" })
    .eq("id", id)
    .in("status", ["draft", "rejected"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: "submitted" });
}

